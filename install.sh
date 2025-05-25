#!/bin/bash

# MCP Demo 项目安装脚本
# 使用 uv 统一管理依赖

set -e  # 遇到错误时退出

echo "🚀 开始安装 MCP Demo 项目依赖..."

# 检查 uv 是否已安装
if ! command -v uv &> /dev/null; then
    echo "❌ uv 未安装，请先安装 uv："
    echo "curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

echo "✅ 检测到 uv 已安装"

# 检查 Python 版本
python_version=$(python3 --version 2>&1 | cut -d' ' -f2 | cut -d'.' -f1,2)
required_version="3.12"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Python 版本需要 >= 3.12，当前版本：$python_version"
    exit 1
fi

echo "✅ Python 版本检查通过：$python_version"

# 安装主项目依赖
echo "📦 安装主项目依赖..."
uv sync

echo "✅ 主项目依赖安装完成"

# 检查子模块是否存在
if [ ! -d "ffmpeg-mcp" ]; then
    echo "⚠️  ffmpeg-mcp 子模块不存在，正在初始化..."
    git submodule update --init --recursive
fi

# 安装子模块依赖
if [ -d "ffmpeg-mcp" ]; then
    echo "📦 安装 ffmpeg-mcp 子模块依赖..."
    cd ffmpeg-mcp
    uv sync
    cd ..
    echo "✅ ffmpeg-mcp 依赖安装完成"
else
    echo "⚠️  ffmpeg-mcp 目录不存在，跳过子模块依赖安装"
fi

# 创建环境变量配置文件
echo "🔧 配置环境变量..."

if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        echo "✅ 已创建 .env 配置文件（基于 env.example）"
        echo "请编辑 .env 文件并填入实际的 API 密钥"
    else
        echo "⚠️  env.example 文件不存在，跳过 .env 文件创建"
    fi
else
    echo "✅ .env 文件已存在"
fi

# 检查环境变量
if [ -z "$NVIDIA_API_KEY" ]; then
    echo "⚠️  NVIDIA_API_KEY 环境变量未设置"
    echo "请在 .env 文件中设置或使用以下命令："
    echo "export NVIDIA_API_KEY='your_api_key_here'"
fi

if [ -z "$TAVILY_API_KEY" ]; then
    echo "ℹ️  TAVILY_API_KEY 环境变量未设置（Web 搜索功能可选）"
    echo "如需使用 Web 搜索功能，请在 .env 文件中设置或使用以下命令："
    echo "export TAVILY_API_KEY='your_tavily_api_key_here'"
fi

# 创建必要的目录
echo "📁 创建必要的目录..."
mkdir -p uploads outputs

echo "🎉 安装完成！"
echo ""
echo "📖 使用方法："
echo "1. Web 界面：python start_web.py 或 uv run python app.py"
echo "2. 命令行演示：uv run python ffmpeg_mcp_demo.py"
echo "3. 查看文档：cat README.md"
echo ""
echo "🌐 Web 界面地址：http://localhost:8000" 