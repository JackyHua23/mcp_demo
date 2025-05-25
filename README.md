# MCP Demo - 基于 NIM 构建的多模态 AI-Agent

这是一个基于 MCP (Model Context Protocol) 的多模态 AI-Agent 演示项目，集成了 FFmpeg 视频处理、Web 搜索等功能，提供命令行和 Web 两种交互方式。

## 🌟 功能特性

### 🎯 核心功能
- **智能对话处理**: 使用自然语言描述视频处理需求
- **FFmpeg 视频处理**: 完整的视频编辑工具链
- **Web 搜索**: 实时网络信息检索
- **多模态交互**: 支持文本、图像、视频等多种媒体格式
- **现代化 Web 界面**: 直观的图形化操作体验

### 🛠️ 支持的视频操作
- 📹 获取视频信息（时长、分辨率、编码等）
- ✂️ 视频剪切（指定时间段）
- 🔗 视频合并（多个文件拼接）
- 📐 视频缩放（调整分辨率）
- 🎭 视频叠加（画中画效果）
- 🎵 音频提取
- 🖼️ 帧提取（生成图片）
- ▶️ 视频播放

## 📁 项目结构

```
mcp_demo/
├── ffmpeg-mcp/                 # FFmpeg MCP 服务器子模块
│   ├── src/ffmpeg_mcp/
│   │   ├── server.py          # MCP 服务器主文件
│   │   ├── cut_video.py       # 视频处理核心逻辑
│   │   └── ...
│   └── pyproject.toml
├── src/                       # 源代码目录
├── static/                    # Web 静态文件
│   ├── index.html            # 主页面
│   ├── style.css             # 样式文件
│   └── script.js             # JavaScript 逻辑
├── uploads/                   # 上传文件目录
├── outputs/                   # 输出文件目录
├── zh_data/                   # 中文数据
├── app.py                     # FastAPI Web 应用
├── demo_web.py               # Web 演示
├── start_web.py              # Web 启动脚本
├── mcp_demo.py               # 基础 MCP 演示
├── ffmpeg_mcp_demo.py        # FFmpeg MCP 演示
├── ffmpeg_mcp_client.py      # 简化的客户端接口
├── ffmpeg_mcp_config.py      # 配置管理
├── web_search.py             # Web 搜索功能
├── install.sh                # 自动安装脚本
├── env.example               # 环境变量配置模板
├── pyproject.toml            # 项目配置
├── uv.lock                   # 依赖锁定文件
└── README.md                 # 本文档
```

## 🚀 快速开始

### 1. 环境准备

确保已安装以下工具：
- Python 3.12+
- [uv](https://docs.astral.sh/uv/) (推荐的 Python 包管理器)
- Git

### 2. 克隆项目

```bash
git clone https://github.com/JackyHua23/mcp_demo.git
cd mcp_demo

# 拉取子模块
git submodule update --init --recursive
```

### 3. 安装依赖

#### 方式1：使用安装脚本（推荐）
```bash
# 运行自动安装脚本
./install.sh
```

#### 方式2：手动安装
使用 `uv sync` 统一管理所有依赖：

```bash
# 安装主项目依赖
uv sync

# 安装 ffmpeg-mcp 子模块依赖
cd ffmpeg-mcp
uv sync
cd ..
```

### 4. 配置环境变量

#### 方式1：使用配置文件
```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env 文件，填入实际的 API 密钥
nano .env
```

#### 方式2：直接设置环境变量
```bash
# NVIDIA API 密钥（必需）
export NVIDIA_API_KEY="your_nvidia_api_key_here"

# Tavily API 密钥（Web 搜索功能，可选）
export TAVILY_API_KEY="your_tavily_api_key_here"
```

**获取 API 密钥：**
- NVIDIA API 密钥：https://build.nvidia.com/
- Tavily API 密钥：https://tavily.com/

### 5. 运行项目

#### 方式1：Web 界面（推荐）
```bash
# 使用启动脚本
python start_web.py

# 或直接启动
uv run python app.py
```

然后打开浏览器访问：http://localhost:8000

#### 方式2：命令行演示
```bash
# 基础 MCP 演示
uv run python mcp_demo.py

# FFmpeg 视频处理演示
uv run python ffmpeg_mcp_demo.py

# Web 搜索演示
uv run python web_search.py
```

## 💻 使用方法

### Web 界面使用

1. **文件上传**: 拖拽视频文件到左侧上传区域
2. **智能对话**: 在右侧聊天区域用自然语言描述需求
3. **快速操作**: 使用预设的操作按钮快速处理视频
4. **文件管理**: 查看、下载、删除上传和输出文件

### 命令行使用

#### 简化客户端接口
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
    
    # 合并视频
    result = await client.concat(["video1.mp4", "video2.mp4"], "output.mp4")
    print(result)

asyncio.run(main())
```

#### 自然语言交互示例
```python
# 使用自然语言描述需求
await client.execute("将 video.mp4 从第10秒开始剪切30秒的内容")
await client.execute("将 video1.mp4 和 video2.mp4 合并成 output.mp4")
await client.execute("从 video.mp4 中提取音频保存为 audio.mp3")
await client.execute("将 video.mp4 缩放到 1920x1080 分辨率")
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

### Web 应用配置
在 `app.py` 中可以修改：
- 服务器端口（默认 8000）
- 文件上传限制
- API 密钥配置
- CORS 设置

## 🎯 技术栈

### 后端
- **FastAPI**: 现代化的 Python Web 框架
- **MCP**: Model Context Protocol 协议
- **LangChain**: AI 应用开发框架
- **NVIDIA NIM**: AI 模型推理服务
- **FFmpeg**: 视频处理工具

### 前端
- **HTML5**: 语义化标记
- **CSS3**: 现代化样式（Grid、Flexbox、动画）
- **JavaScript ES6+**: 原生 JavaScript
- **Font Awesome**: 图标库

### 包管理
- **uv**: 快速的 Python 包管理器和项目管理工具
- **pyproject.toml**: 现代 Python 项目配置

## 📚 API 文档

### Web API 端点
- `GET /` - 主页面
- `POST /api/upload` - 文件上传
- `GET /api/files` - 获取文件列表
- `POST /api/process` - 处理视频请求
- `GET /api/tools` - 获取可用工具
- `GET /api/download/{type}/{filename}` - 文件下载
- `DELETE /api/files/{type}/{filename}` - 文件删除

启动应用后访问 API 文档：http://localhost:8000/docs

### FFmpeg MCP 工具

1. **find_video_path** - 查找视频文件
2. **get_video_info** - 获取视频信息
3. **clip_video** - 剪切视频
4. **concat_videos** - 合并视频
5. **play_video** - 播放视频
6. **overlay_video** - 视频叠加
7. **scale_video** - 视频缩放
8. **extract_frames_from_video** - 提取视频帧
9. **extract_audio_from_video** - 提取音频

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
    print("\n🎵 提取音频...")
    audio_result = await client.extract_audio("input.mp4", "audio.mp3")
    print(audio_result)
    
    # 5. 缩放视频
    print("\n📐 缩放视频...")
    scale_result = await client.scale("input.mp4", 1280, 720, "scaled.mp4")
    print(scale_result)

# 运行工作流
asyncio.run(video_workflow())
```

## 🔒 安全考虑

- 文件类型验证
- 文件大小限制
- 路径安全检查
- CORS 配置
- API 密钥保护

## 🐛 故障排除

### 常见问题

1. **依赖安装失败**
   ```bash
   # 清理缓存并重新安装
   uv cache clean
   uv sync --reinstall
   ```

2. **子模块拉取失败**
   ```bash
   # 重新初始化子模块
   git submodule deinit --all -f
   git submodule update --init --recursive
   ```

3. **端口被占用**
   ```bash
   # 查找占用端口的进程
   lsof -i :8000
   # 或修改 app.py 中的端口号
   ```

4. **FFmpeg MCP 连接失败**
   - 确保 `ffmpeg-mcp` 目录存在且依赖已安装
   - 检查 NVIDIA API 密钥配置
   - 验证网络连接

5. **视频处理失败**
   - 确保系统已安装 FFmpeg
   - 检查视频文件格式和路径
   - 查看错误日志获取详细信息

## 📈 性能优化

- 使用 `uv` 进行快速依赖管理
- 异步处理提高并发性能
- 文件流式传输减少内存占用
- 缓存机制提升响应速度

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [MCP](https://github.com/modelcontextprotocol/python-sdk) - Model Context Protocol
- [NVIDIA NIM](https://developer.nvidia.com/nim) - AI 模型推理服务
- [FFmpeg](https://ffmpeg.org/) - 视频处理工具
- [FastAPI](https://fastapi.tiangolo.com/) - Web 框架
- [uv](https://docs.astral.sh/uv/) - Python 包管理器

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: [提交问题](https://github.com/JackyHua23/mcp_demo/issues)
- Email: [your-email@example.com]

---

⭐ 如果这个项目对你有帮助，请给它一个星标！
