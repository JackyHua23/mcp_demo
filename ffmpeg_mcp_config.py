# ffmpeg_mcp_config.py - FFmpeg MCP 配置管理
import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class FFmpegMCPConfig:
    """FFmpeg MCP配置类"""
    
    # NVIDIA API配置
    api_key: Optional[str] = None
    model: str = "nvidia/llama-3.1-nemotron-ultra-253b-v1"
    base_url: str = "https://integrate.api.nvidia.com/v1"
    
    # FFmpeg MCP服务器配置
    ffmpeg_mcp_path: Optional[str] = None
    
    # 系统提示配置
    system_prompt: str = (
        "你是一个专业的视频处理助手，可以使用FFmpeg工具来帮助用户进行视频编辑操作。"
        "你可以查找视频、获取视频信息、剪切、合并、播放、叠加、缩放视频，以及提取帧和音频。"
        "请根据用户的需求选择合适的工具并执行相应操作。"
    )
    
    def __post_init__(self):
        """初始化后处理"""
        # 如果没有指定API密钥，尝试从环境变量获取
        if not self.api_key:
            self.api_key = os.getenv(
                "NVIDIA_API_KEY",
                ("nvapi-eVqx3Byag8gqjACkiH0lPHIq-_eN1JMkqM2NSyJUYoYQIx0v"
                 "V9OPSJSOaS70Jkd1")
            )
        
        # 如果没有指定ffmpeg-mcp路径，使用默认路径
        if not self.ffmpeg_mcp_path:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            self.ffmpeg_mcp_path = os.path.join(current_dir, "ffmpeg-mcp")
    
    def get_server_command(self):
        """获取服务器启动命令"""
        return ["uv", "--directory", self.ffmpeg_mcp_path, "run", "ffmpeg-mcp"]
    
    def validate(self):
        """验证配置"""
        if not self.api_key:
            raise ValueError("API密钥未设置")
        
        if not os.path.exists(self.ffmpeg_mcp_path):
            raise FileNotFoundError(f"FFmpeg MCP路径不存在: {self.ffmpeg_mcp_path}")
        
        server_py = os.path.join(
            self.ffmpeg_mcp_path, "src", "ffmpeg_mcp", "server.py"
        )
        if not os.path.exists(server_py):
            raise FileNotFoundError(f"FFmpeg MCP服务器文件不存在: {server_py}")
        
        return True


# 工具描述映射
FFMPEG_TOOLS = {
    "find_video_path": {
        "name": "查找视频文件",
        "description": "在指定目录中递归查找视频文件",
        "example": "帮我在/Users/videos目录下找到名为test.mp4的视频"
    },
    "get_video_info": {
        "name": "获取视频信息",
        "description": "获取视频的详细信息，包括时长、帧率、编码格式等",
        "example": "获取video.mp4的详细信息"
    },
    "clip_video": {
        "name": "剪切视频",
        "description": "从视频中剪切指定时间段的内容",
        "example": "将video.mp4从第10秒开始剪切30秒的内容"
    },
    "concat_videos": {
        "name": "合并视频",
        "description": "将多个视频文件合并成一个",
        "example": "将video1.mp4和video2.mp4合并成output.mp4"
    },
    "play_video": {
        "name": "播放视频",
        "description": "使用ffplay播放视频文件",
        "example": "播放video.mp4"
    },
    "overlay_video": {
        "name": "视频叠加",
        "description": "将一个视频叠加到另一个视频上（画中画效果）",
        "example": "将小视频叠加到大视频的右上角"
    },
    "scale_video": {
        "name": "视频缩放",
        "description": "改变视频的分辨率",
        "example": "将video.mp4缩放到1920x1080分辨率"
    },
    "extract_frames_from_video": {
        "name": "提取视频帧",
        "description": "从视频中提取图片帧",
        "example": "从video.mp4中每秒提取一帧图片"
    },
    "extract_audio_from_video": {
        "name": "提取音频",
        "description": "从视频中提取音频轨道",
        "example": "从video.mp4中提取音频保存为audio.mp3"
    }
}


def get_tool_help():
    """获取工具帮助信息"""
    help_text = "可用的FFmpeg工具:\n"
    help_text += "=" * 50 + "\n"
    
    for tool_id, info in FFMPEG_TOOLS.items():
        help_text += f"\n📹 {info['name']} ({tool_id})\n"
        help_text += f"   功能: {info['description']}\n"
        help_text += f"   示例: {info['example']}\n"
    
    return help_text 