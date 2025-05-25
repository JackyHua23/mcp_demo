#!/usr/bin/env python3
"""
FFmpeg MCP Web 应用启动脚本
"""
import os
import sys
import subprocess
import webbrowser
from pathlib import Path


def check_dependencies():
    """检查依赖是否安装"""
    try:
        import fastapi
        import uvicorn
        print("✅ FastAPI 依赖已安装")
        return True
    except ImportError:
        print("❌ 缺少 FastAPI 依赖")
        return False


def install_dependencies():
    """安装依赖"""
    print("正在安装 Web 前端依赖...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", 
            "-r", "web_requirements.txt"
        ])
        print("✅ 依赖安装完成")
        return True
    except subprocess.CalledProcessError:
        print("❌ 依赖安装失败")
        return False


def start_server():
    """启动服务器"""
    print("🚀 启动 FFmpeg MCP Web 应用...")
    print("📍 服务地址: http://localhost:8000")
    print("🔧 API 文档: http://localhost:8000/docs")
    print("⏹️  按 Ctrl+C 停止服务")
    
    # 自动打开浏览器
    try:
        webbrowser.open("http://localhost:8000")
    except:
        pass
    
    # 启动服务器
    os.system("python app.py")


def main():
    """主函数"""
    print("=" * 60)
    print("🎬 FFmpeg MCP 智能视频处理助手 - Web 版")
    print("=" * 60)
    
    # 检查当前目录
    if not Path("app.py").exists():
        print("❌ 请在项目根目录运行此脚本")
        sys.exit(1)
    
    # 检查并安装依赖
    if not check_dependencies():
        if not install_dependencies():
            print("❌ 无法安装依赖，请手动运行: pip install -r web_requirements.txt")
            sys.exit(1)
    
    # 创建必要的目录
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("outputs", exist_ok=True)
    os.makedirs("static", exist_ok=True)
    
    # 启动服务器
    start_server()


if __name__ == "__main__":
    main() 