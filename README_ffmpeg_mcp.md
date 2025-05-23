# FFmpeg MCP 智能视频处理助手

这是一个基于 MCP (Model Context Protocol) 的 FFmpeg 视频处理封装，允许通过自然语言与 FFmpeg 工具进行交互。

## 📁 项目结构

```
├── ffmpeg-mcp/                 # FFmpeg MCP 服务器目录
│   ├── src/ffmpeg_mcp/
│   │   ├── server.py          # MCP 服务器主文件
│   │   ├── cut_video.py       # 视频处理核心逻辑
│   │   └── ...
│   └── pyproject.toml
├── mcp_demo.py                # 原始 MCP 演示文件（已修复）
├── ffmpeg_mcp_demo.py         # 完整的 FFmpeg MCP 演示
├── ffmpeg_mcp_client.py       # 简化的客户端接口
├── ffmpeg_mcp_config.py       # 配置管理
└── README_ffmpeg_mcp.md       # 本文档
```

## 🚀 快速开始

### 1. 环境准备

确保已安装以下依赖：
```bash
# 安装 Python 依赖
pip install mcp-llm-bridge python-dotenv

# 确保 ffmpeg-mcp 目录下的依赖已安装
cd ffmpeg-mcp
uv sync
```

### 2. 配置 NVIDIA API 密钥

设置环境变量或在代码中配置：
```bash
export NVIDIA_API_KEY="your_api_key_here"
```

### 3. 基本使用

#### 方式1：使用完整演示程序
```bash
python ffmpeg_mcp_demo.py
```

#### 方式2：使用简化客户端
```python
import asyncio
from ffmpeg_mcp_client import SimpleFFmpegMCPClient

async def main():
    client = SimpleFFmpegMCPClient()
    
    # 获取视频信息
    result = await client.get_info("video.mp4")
    print(result)
    
    # 剪切视频
    result = await client.clip("video.mp4", start="00:01:00", duration="30")
    print(result)

asyncio.run(main())
```

## 🛠️ 可用功能

### 1. 查找视频文件 (find_video_path)
```python
# 自然语言方式
await client.execute("在/Users/videos目录下找到名为test.mp4的视频")

# 方法调用方式
await client.find_video("/Users/videos", "test.mp4")
```

### 2. 获取视频信息 (get_video_info)
```python
# 自然语言方式
await client.execute("获取video.mp4的详细信息")

# 方法调用方式
await client.get_info("video.mp4")
```

### 3. 剪切视频 (clip_video)
```python
# 自然语言方式
await client.execute("将video.mp4从第10秒开始剪切30秒的内容")

# 方法调用方式
await client.clip("video.mp4", start="10", duration="30")
```

### 4. 合并视频 (concat_videos)
```python
# 自然语言方式
await client.execute("将video1.mp4和video2.mp4合并成output.mp4")

# 方法调用方式
await client.concat(["video1.mp4", "video2.mp4"], "output.mp4")
```

### 5. 播放视频 (play_video)
```python
# 自然语言方式
await client.execute("播放video.mp4，速度2倍")

# 方法调用方式
await client.play("video.mp4", speed=2)
```

### 6. 视频叠加 (overlay_video)
```python
# 自然语言方式
await client.execute("将小视频叠加到大视频的右上角")

# 方法调用方式
await client.overlay("background.mp4", "overlay.mp4", position="right_top")
```

### 7. 视频缩放 (scale_video)
```python
# 自然语言方式
await client.execute("将video.mp4缩放到1920x1080分辨率")

# 方法调用方式
await client.scale("video.mp4", 1920, 1080)
```

### 8. 提取视频帧 (extract_frames_from_video)
```python
# 自然语言方式
await client.execute("从video.mp4中每秒提取一帧图片")

# 方法调用方式
await client.extract_frames("video.mp4", fps=1, format="png")
```

### 9. 提取音频 (extract_audio_from_video)
```python
# 自然语言方式
await client.execute("从video.mp4中提取音频保存为audio.mp3")

# 方法调用方式
await client.extract_audio("video.mp4", "audio.mp3")
```

## 🔧 配置选项

### 自定义配置
```python
from ffmpeg_mcp_config import FFmpegMCPConfig
from ffmpeg_mcp_client import SimpleFFmpegMCPClient

# 创建自定义配置
config = FFmpegMCPConfig(
    api_key="your_api_key",
    model="nvidia/llama-3.1-nemotron-ultra-253b-v1",
    base_url="https://integrate.api.nvidia.com/v1",
    ffmpeg_mcp_path="/path/to/ffmpeg-mcp"
)

# 使用自定义配置创建客户端
client = SimpleFFmpegMCPClient(config)
```

## 💡 使用示例

### 完整的视频处理工作流
```python
import asyncio
from ffmpeg_mcp_client import SimpleFFmpegMCPClient

async def video_workflow():
    client = SimpleFFmpegMCPClient()
    
    # 1. 查找视频文件
    print("🔍 查找视频文件...")
    result = await client.find_video("/Users/videos", "input.mp4")
    print(result)
    
    # 2. 获取视频信息
    print("\n📊 获取视频信息...")
    info = await client.get_info("input.mp4")
    print(info)
    
    # 3. 剪切视频
    print("\n✂️ 剪切视频...")
    clip_result = await client.clip(
        "input.mp4", 
        start="00:00:10", 
        duration="00:00:30",
        output="clip.mp4"
    )
    print(clip_result)
    
    # 4. 提取音频
    print("\n🔊 提取音频...")
    audio_result = await client.extract_audio("clip.mp4", "audio.mp3")
    print(audio_result)

asyncio.run(video_workflow())
```

## 🚨 故障排除

### 常见问题

1. **FFmpeg MCP 路径不存在**
   - 确保 `ffmpeg-mcp` 目录在正确位置
   - 检查路径配置是否正确

2. **API 密钥错误**
   - 确认 NVIDIA API 密钥有效
   - 检查环境变量设置

3. **依赖缺失**
   - 确保安装了所有必要的 Python 包
   - 在 ffmpeg-mcp 目录下运行 `uv sync`

4. **视频文件不存在**
   - 确认视频文件路径正确
   - 检查文件权限

### 调试模式
```python
import logging
logging.basicConfig(level=logging.DEBUG)

# 然后运行你的代码
```

## 📚 扩展开发

### 添加新功能
1. 在 `ffmpeg-mcp/src/ffmpeg_mcp/server.py` 中添加新的 MCP 工具
2. 在 `ffmpeg_mcp_config.py` 中更新工具描述
3. 在 `ffmpeg_mcp_client.py` 中添加便捷方法

### 自定义系统提示
```python
config = FFmpegMCPConfig(
    system_prompt="你的自定义系统提示..."
)
```

## 📄 许可证

本项目基于原始 ffmpeg-mcp 项目，请参考相关许可证信息。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目！ 