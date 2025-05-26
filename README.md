# MCP Demo - 基于 NVIDIA NIM 的智能视频处理 AI-Agent

<div align="center">

![Python](https://img.shields.io/badge/Python-3.12+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green.svg)
![MCP](https://img.shields.io/badge/MCP-1.6+-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

一个基于 MCP (Model Context Protocol) 的智能视频处理 AI-Agent，集成 NVIDIA NIM、FFmpeg 和 Web 搜索功能，提供自然语言视频编辑体验。

[🚀 快速开始](#-快速开始) • [📖 使用指南](#-使用指南) • [🛠️ API 文档](#️-api-文档) 

</div>

## ✨ 项目特色

### 🎯 核心亮点
- **🤖 自然语言交互**: 用中文描述需求，AI 自动选择合适的工具执行
- **🎬 专业视频处理**: 基于 FFmpeg 的完整视频编辑工具链
- **🌐 现代化 Web 界面**: 响应式设计，支持拖拽上传和实时预览
- **⚡ 流式响应**: 实时显示处理进度和 AI 思考过程

### 🛠️ 支持的视频操作
| 功能 | 描述 | 示例命令 |
|------|------|----------|
| 📹 **视频信息** | 获取时长、分辨率、编码等详细信息 | "获取 video.mp4 的详细信息" |
| ✂️ **智能剪切** | 按时间段精确剪切视频片段 | "从第30秒开始剪切1分钟" |
| 🔗 **无缝合并** | 多个视频文件智能拼接 | "将这三个视频合并成一个" |
| 📐 **分辨率调整** | 视频缩放和分辨率转换 | "将视频调整为1080p" |
| 🎭 **画中画效果** | 视频叠加和画中画制作 | "在主视频右上角添加小窗口" |
| 🎵 **音频提取** | 从视频中提取高质量音频 | "提取视频中的背景音乐" |
| 🖼️ **帧提取** | 按帧率提取视频截图 | "每秒提取一张图片" |
| ▶️ **预览播放** | 内置视频播放器预览 | "播放处理后的视频" |

## 📁 项目架构

```text
mcp_demo/
├── 🌐 Web 前端层
│   ├── static/
│   │   ├── index.html              # 主界面 - 现代化响应式设计
│   │   ├── demo_separated.html     # AI 对话演示页面
│   │   ├── test_stream.html        # 流式响应测试页面
│   │   ├── style.css               # 样式文件 - CSS Grid + Flexbox
│   │   └── script.js               # 前端逻辑 - 原生 ES6+
│   └── app.py                      # FastAPI Web 服务器
│
├── 🤖 AI 处理层
│   ├── ffmpeg_mcp_demo.py          # MCP 客户端核心
│   ├── ffmpeg_mcp_config.py        # 配置管理
│   └── demo_web.py                 # Web 演示脚本
│
├── 🎬 视频处理层 (子模块)
│   └── ffmpeg-mcp/                 # FFmpeg MCP 服务器
│       └── src/ffmpeg_mcp/
│           ├── server.py           # MCP 协议服务器
│           ├── cut_video.py        # 视频处理核心算法
│           ├── ffmpeg.py           # FFmpeg 命令封装
│           ├── typedef.py          # 类型定义和数据结构
│           └── utils.py            # 工具函数库
│
├── 📁 数据存储层
│   ├── uploads/                    # 用户上传文件
│   └── outputs/                    # 处理结果输出
│
└── ⚙️ 配置文件
    ├── pyproject.toml              # 项目依赖和配置
    ├── uv.lock                     # 依赖版本锁定
    ├── .gitmodules                 # Git 子模块配置
    └── env.example                 # 环境变量模板
```

## 🚀 快速开始

### 📋 环境要求

- **Python**: 3.12+ (推荐 3.12.7)
- **包管理器**: [uv](https://docs.astral.sh/uv/) (现代化 Python 包管理)
- **系统工具**: Git, FFmpeg
- **API 密钥**: NVIDIA API Key

### 🔧 安装步骤

#### 1️⃣ 克隆项目
```bash
# 克隆主项目
git clone https://github.com/JackyHua23/mcp_demo.git
cd mcp_demo

# 初始化子模块
git submodule update --init --recursive
```

#### 2️⃣ 安装依赖
```bash
# 使用 uv 安装主项目依赖
uv sync

# 安装 FFmpeg MCP 子模块依赖
cd ffmpeg-mcp
uv sync
cd ..
```

#### 3️⃣ 配置环境变量
```bash
# 复制环境变量模板
cp env.example .env

# 编辑配置文件
nano .env
```

**环境变量配置：**
```bash
# NVIDIA API 密钥 (必需) - 获取地址: https://build.nvidia.com/
NVIDIA_API_KEY="your_nvidia_api_key_here"
```

#### 4️⃣ 启动应用
```bash
# 方式1：使用演示脚本启动 (推荐)
uv run python demo_web.py

# 方式2：直接启动 FastAPI 应用
uv run python app.py

# 方式3：使用 uvicorn 启动 (开发模式)
uv run uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```

🎉 **访问应用**: http://localhost:8000

## 💻 使用指南

### 🌐 Web 界面操作

#### 📤 文件上传
1. **拖拽上传**: 将视频文件拖拽到左侧上传区域
2. **点击上传**: 点击上传按钮选择文件
3. **格式支持**: MP4, AVI, MOV, MKV, WMV, FLV, WebM

#### 💬 智能对话
在右侧聊天区域输入自然语言指令：

```text
✅ 支持的指令示例：
• "获取当前视频的详细信息"
• "从第30秒开始剪切1分钟的内容"
• "将视频分辨率调整为1920x1080"
• "提取视频中的音频保存为MP3格式"
• "在视频右上角添加水印效果"
```

#### ⚡ 快速操作
使用预设按钮快速执行常用操作：
- 🔍 **获取信息** - 查看视频详细参数
- ✂️ **智能剪切** - 快速剪切视频片段
- 🎵 **提取音频** - 导出音频文件
- 📐 **调整尺寸** - 修改视频分辨率

### 🖥️ 命令行使用

#### 基础示例
```python
import asyncio
from ffmpeg_mcp_demo import FFmpegMCPClient

async def main():
    client = FFmpegMCPClient()
    
    # 自然语言处理
    response = await client.process_video_request(
        "将 uploads/video.mp4 从第10秒开始剪切30秒"
    )
    print(response)

asyncio.run(main())
```

#### 高级配置
```python
from ffmpeg_mcp_config import FFmpegMCPConfig
from ffmpeg_mcp_demo import FFmpegMCPClient

# 自定义配置
config = FFmpegMCPConfig(
    api_key="your_nvidia_api_key",
    model="nvidia/llama-3.1-nemotron-ultra-253b-v1",
    base_url="https://integrate.api.nvidia.com/v1"
)

client = FFmpegMCPClient(
    api_key=config.api_key,
    model=config.model,
    base_url=config.base_url
)
```

## 🛠️ API 文档

### 🌐 Web API 端点

| 方法 | 端点 | 描述 | 参数 |
|------|------|------|------|
| `GET` | `/` | 主页面 | - |
| `GET` | `/demo` | AI 对话演示页面 | - |
| `POST` | `/api/upload` | 文件上传 | `file: UploadFile` |
| `GET` | `/api/files` | 获取文件列表 | - |
| `POST` | `/api/process` | 处理视频请求 | `message: str, video_path?: str` |
| `POST` | `/api/process-stream` | 流式处理请求 | `message: str, video_path?: str` |
| `GET` | `/api/tools` | 获取可用工具 | - |
| `GET` | `/api/download/{type}/{filename}` | 文件下载 | `type: str, filename: str` |
| `DELETE` | `/api/files/{type}/{filename}` | 文件删除 | `type: str, filename: str` |

### 🎬 FFmpeg MCP 工具

| 工具名称 | 功能描述 | 参数说明 |
|----------|----------|----------|
| `find_video_path` | 智能查找视频文件 | `root_path`, `video_name` |
| `get_video_info` | 获取视频详细信息 | `video_path` |
| `clip_video` | 精确剪切视频片段 | `video_path`, `start`, `end/duration`, `output_path?` |
| `concat_videos` | 无缝合并多个视频 | `input_files[]`, `output_path?`, `fast?` |
| `scale_video` | 调整视频分辨率 | `video_path`, `width`, `height`, `output_path?` |
| `overlay_video` | 视频叠加效果 | `background_video`, `overlay_video`, `position?`, `dx?`, `dy?` |
| `extract_audio_from_video` | 提取音频轨道 | `video_path`, `output_path?`, `audio_format?` |
| `extract_frames_from_video` | 提取视频帧 | `video_path`, `fps?`, `output_folder?`, `format?` |
| `play_video` | 播放视频预览 | `video_path`, `speed?`, `loop?` |

## 🎯 技术栈详解

### 🔧 后端技术
- **FastAPI**: 高性能异步 Web 框架，自动生成 API 文档
- **MCP**: Model Context Protocol，AI 工具调用标准协议
- **NVIDIA NIM**: 企业级 AI 推理服务，支持 Llama 3.1 Nemotron
- **FFmpeg**: 业界标准的多媒体处理工具
- **uv**: 下一代 Python 包管理器，比 pip 快 10-100 倍

### 🎨 前端技术
- **HTML5**: 语义化标记，支持拖拽 API
- **CSS3**: 现代化样式，Grid + Flexbox 布局，CSS 动画
- **JavaScript ES6+**: 原生 JavaScript，Fetch API，WebSocket
- **Font Awesome**: 矢量图标库

### 📦 依赖管理
- **pyproject.toml**: 现代 Python 项目配置标准
- **uv.lock**: 确保依赖版本一致性
- **Git Submodules**: 模块化代码管理



