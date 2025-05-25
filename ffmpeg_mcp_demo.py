# ffmpeg_mcp_demo.py - FFmpeg MCP 服务器调用示例
import asyncio
import os
from dotenv import load_dotenv
from mcp import StdioServerParameters
from mcp_llm_bridge.config import BridgeConfig, LLMConfig
from mcp_llm_bridge.bridge import BridgeManager
import logging

# Setup logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



class FFmpegMCPClient:
    """FFmpeg MCP客户端，用于与ffmpeg-mcp服务器交互"""
    
    def __init__(self, api_key=None, model=None, base_url=None):
        """
        初始化FFmpeg MCP客户端
        
        Args:
            api_key: NVIDIA API密钥
            model: 使用的模型名称
            base_url: API基础URL
        """
        load_dotenv()
        
        # 获取ffmpeg-mcp目录的绝对路径
        current_dir = os.path.dirname(os.path.abspath(__file__))
        ffmpeg_mcp_dir = os.path.join(current_dir, "ffmpeg-mcp")
        project_root = current_dir
        uploads_dir = os.path.join(project_root, "uploads")
        outputs_dir = os.path.join(project_root, "outputs")
        # uploads = os.path.join(project_root,uploads_dir)
        # outputs = os.path.join(project_root,outputs_dir)
        # print(uploads)
        self.api_key = api_key or os.getenv(
            "NVIDIA_API_KEY", 
            ("nvapi-eVqx3Byag8gqjACkiH0lPHIq-_eN1JMkqM2NSyJUYoYQIx0v"
             "V9OPSJSOaS70Jkd1")
        )
        self.model = model or "nvidia/llama-3.1-nemotron-ultra-253b-v1"
        self.base_url = base_url or "https://integrate.api.nvidia.com/v1"
        
        # 配置ffmpeg-mcp服务器参数
        self.config = BridgeConfig(
            mcp_server_params=StdioServerParameters(
                command="uv",
                args=[
                    "--directory",
                    ffmpeg_mcp_dir,
                    "run",
                    "ffmpeg-mcp"
                ],
                env=None
            ),
            llm_config=LLMConfig(
                api_key=self.api_key,
                model=self.model,
                base_url=self.base_url
            ),
            system_prompt=(
                "你是一个专业的视频处理助手，可以使用FFmpeg工具来帮助用户进行视频编辑、"
                "剪切、合并、格式转换等操作。你可以：\n"
                "1. 查找视频文件路径\n"
                "2. 获取视频信息\n"
                "3. 剪切视频片段\n"
                "4. 合并多个视频\n"
                "5. 播放视频\n"
                "6. 视频叠加效果\n"
                "7. 视频缩放\n"
                "8. 提取视频帧为图片\n"
                "9. 提取视频中的音频\n"
                "请根据用户的需求选择合适的工具并执行相应操作。\n"
                f"上传文件的绝对路径在: {uploads_dir}\n"
                f"输出文件的绝对路径在: {outputs_dir}\n"
                "当用户提供文件路径时，请使用这些绝对路径。\n"
            )
        )
    
    async def process_video_request(self, user_input):
        """
        处理视频相关请求
        
        Args:
            user_input: 用户输入的请求
            
        Returns:
            处理结果
        """
        try:
            async with BridgeManager(self.config) as bridge:
                response = await bridge.process_message(user_input)
                return response
        except Exception as e:
            logger.error(f"处理请求时发生错误: {e}")
            return f"错误: {e}"
    
    def get_available_tools(self):
        """获取可用的工具列表"""
        tools = [
            "find_video_path - 查找视频文件路径",
            "get_video_info - 获取视频信息",
            "clip_video - 剪切视频",
            "concat_videos - 合并视频",
            "play_video - 播放视频",
            "overlay_video - 视频叠加",
            "scale_video - 视频缩放",
            "extract_frames_from_video - 提取视频帧",
            "extract_audio_from_video - 提取音频"
        ]
        return tools


async def interactive_demo():
    """交互式演示"""
    print("=" * 60)
    print("FFmpeg MCP 智能视频处理助手")
    print("=" * 60)
    print("可用功能:")
    
    client = FFmpegMCPClient()
    tools = client.get_available_tools()
    for i, tool in enumerate(tools, 1):
        print(f"{i:2}. {tool}")
    
    print("\n示例用法:")
    print("- 查找视频: '帮我在/Users/videos目录下找到名为test.mp4的视频'")
    print("- 剪切视频: '将video.mp4从第10秒开始剪切30秒的内容'")
    print("- 获取信息: '获取video.mp4的详细信息'")
    print("- 合并视频: '将video1.mp4和video2.mp4合并成output.mp4'")
    print("=" * 60)
    
    while True:
        try:
            user_input = input("\n请输入您的需求 (输入 'quit' 退出): ").strip()
            
            if user_input.lower() in ['quit', 'exit', '退出']:
                print("再见! 👋")
                break
            
            if not user_input:
                print("请输入有效的指令")
                continue
            
            print("\n🎬 正在处理您的请求...")
            response = await client.process_video_request(user_input)
            print(f"\n✅ 处理结果:\n{response}")
            
        except KeyboardInterrupt:
            print("\n\n用户中断操作，再见! 👋")
            break
        except Exception as e:
            logger.error(f"发生未预期的错误: {e}")


async def example_usage():
    """示例用法演示"""
    print("FFmpeg MCP 示例用法演示")
    print("=" * 40)
    
    client = FFmpegMCPClient()
    
    # 示例请求
    examples = [
        "获取当前目录下所有可用的视频处理工具",
        "如何剪切一个视频文件？",
        "如何将多个视频文件合并？"
    ]
    
    for example in examples:
        print(f"\n📝 示例请求: {example}")
        print("📋 处理中...")
        try:
            response = await client.process_video_request(example)
            print(f"✅ 响应: {response}")
        except Exception as e:
            print(f"❌ 错误: {e}")
        print("-" * 40)


def main():
    """主函数"""
    print("欢迎使用 FFmpeg MCP 智能视频处理助手! 🎬")
    # print("\n选择模式:")
    # print("1. 交互式模式")
    # print("2. 示例演示模式")
    asyncio.run(interactive_demo())
    # try:
    #     choice = input("\n请选择模式 (1/2): ").strip()
        
    #     if choice == "1":
    #         asyncio.run(interactive_demo())
    #     elif choice == "2":
    #         asyncio.run(example_usage())
    #     else:
    #         print("无效选择，启动交互式模式...")
    #         asyncio.run(interactive_demo())
            
    # except KeyboardInterrupt:
    #     print("\n\n程序被用户中断")
    # except Exception as e:
    #     logger.error(f"程序运行错误: {e}")


if __name__ == "__main__":
    main() 