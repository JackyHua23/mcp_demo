# ffmpeg_mcp_client.py - 简化的FFmpeg MCP客户端
import asyncio
import logging
from mcp import StdioServerParameters
from mcp_llm_bridge.config import BridgeConfig, LLMConfig
from mcp_llm_bridge.bridge import BridgeManager
from ffmpeg_mcp_config import FFmpegMCPConfig, get_tool_help

# 设置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SimpleFFmpegMCPClient:
    """简化的FFmpeg MCP客户端"""
    
    def __init__(self, config=None):
        """
        初始化客户端
        
        Args:
            config: FFmpegMCPConfig实例，如果为None则使用默认配置
        """
        self.config = config or FFmpegMCPConfig()
        self.config.validate()
        
        # 创建MCP桥接配置
        self.bridge_config = BridgeConfig(
            mcp_server_params=StdioServerParameters(
                command="uv",
                args=[
                    "--directory",
                    self.config.ffmpeg_mcp_path,
                    "run",
                    "ffmpeg-mcp"
                ],
                env=None
            ),
            llm_config=LLMConfig(
                api_key=self.config.api_key,
                model=self.config.model,
                base_url=self.config.base_url
            ),
            system_prompt=self.config.system_prompt
        )
    
    async def execute(self, command):
        """
        执行FFmpeg命令
        
        Args:
            command: 用户命令字符串
            
        Returns:
            执行结果
        """
        try:
            async with BridgeManager(self.bridge_config) as bridge:
                response = await bridge.process_message(command)
                return response
        except Exception as e:
            error_msg = f"执行命令时发生错误: {e}"
            logger.error(error_msg)
            return error_msg
    
    def help(self):
        """显示帮助信息"""
        return get_tool_help()
    
    # 便捷方法
    async def find_video(self, directory, filename):
        """查找视频文件"""
        command = f"在{directory}目录下查找名为{filename}的视频文件"
        return await self.execute(command)
    
    async def get_info(self, video_path):
        """获取视频信息"""
        command = f"获取{video_path}的详细信息"
        return await self.execute(command)
    
    async def clip(self, video_path, start=None, end=None, duration=None, 
                   output=None):
        """剪切视频"""
        command = f"剪切视频{video_path}"
        if start:
            command += f"，从{start}开始"
        if end:
            command += f"，到{end}结束"
        if duration:
            command += f"，持续{duration}"
        if output:
            command += f"，输出到{output}"
        return await self.execute(command)
    
    async def concat(self, video_list, output=None):
        """合并视频"""
        files_str = "、".join(video_list)
        command = f"将{files_str}合并"
        if output:
            command += f"成{output}"
        return await self.execute(command)
    
    async def play(self, video_path, speed=1, loop=False):
        """播放视频"""
        command = f"播放{video_path}"
        if speed != 1:
            command += f"，播放速度{speed}倍"
        if loop:
            command += "，循环播放"
        return await self.execute(command)
    
    async def overlay(self, background_video, overlay_video, output=None, 
                      position="left_top"):
        """视频叠加"""
        position_map = {
            "left_top": "左上角",
            "right_top": "右上角", 
            "left_bottom": "左下角",
            "right_bottom": "右下角",
            "center": "居中"
        }
        pos_desc = position_map.get(position, position)
        command = f"将{overlay_video}叠加到{background_video}的{pos_desc}"
        if output:
            command += f"，输出到{output}"
        return await self.execute(command)
    
    async def scale(self, video_path, width, height, output=None):
        """视频缩放"""
        command = f"将{video_path}缩放到{width}x{height}分辨率"
        if output:
            command += f"，输出到{output}"
        return await self.execute(command)
    
    async def extract_frames(self, video_path, fps=1, output_dir=None, 
                             format="png"):
        """提取视频帧"""
        command = f"从{video_path}中提取帧，每{fps}秒一帧"
        if output_dir:
            command += f"，保存到{output_dir}"
        command += f"，格式为{format}"
        return await self.execute(command)
    
    async def extract_audio(self, video_path, output=None, format="mp3"):
        """提取音频"""
        command = f"从{video_path}中提取音频"
        if output:
            command += f"，保存为{output}"
        else:
            command += f"，格式为{format}"
        return await self.execute(command)


async def demo():
    """演示用法"""
    print("FFmpeg MCP客户端演示")
    print("=" * 40)
    
    client = SimpleFFmpegMCPClient()
    
    # 显示帮助信息
    print("\n📚 可用工具:")
    print(client.help())
    
    # 示例操作
    examples = [
        "如何使用这些工具？",
        "ffmpeg有哪些功能？",
        "如何剪切一个视频文件？"
    ]
    
    for example in examples:
        print(f"\n🤔 问题: {example}")
        try:
            response = await client.execute(example)
            print(f"💡 回答: {response}")
        except Exception as e:
            print(f"❌ 错误: {e}")
        print("-" * 40)


if __name__ == "__main__":
    asyncio.run(demo()) 