#!/usr/bin/env python3
"""
FFmpeg MCP Web 前端演示脚本
"""
import os
import time
import webbrowser
from pathlib import Path


def print_banner():
    """打印横幅"""
    print("=" * 80)
    print("🎬 FFmpeg MCP 智能视频处理助手 - Web 前端演示")
    print("=" * 80)
    print()


def check_files():
    """检查必要文件是否存在"""
    required_files = [
        "app.py",
        "static/index.html", 
        "static/style.css",
        "static/script.js",
        "ffmpeg_mcp_demo.py"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ 缺少以下文件:")
        for file in missing_files:
            print(f"   - {file}")
        return False
    
    print("✅ 所有必要文件都存在")
    return True


def create_sample_video():
    """创建示例视频文件（如果不存在）"""
    uploads_dir = Path("uploads")
    uploads_dir.mkdir(exist_ok=True)
    
    # 这里可以添加创建示例视频的逻辑
    # 或者提示用户上传视频文件
    print("📁 上传目录已创建: uploads/")
    print("💡 提示: 您可以将视频文件放入 uploads/ 目录进行测试")


def show_usage_guide():
    """显示使用指南"""
    print("\n📖 使用指南:")
    print("-" * 40)
    print("1. 🌐 Web 界面功能:")
    print("   • 左侧面板: 文件上传和管理")
    print("   • 右侧面板: AI 对话和快速操作")
    print()
    print("2. 💬 AI 对话示例:")
    print("   • '获取 video.mp4 的详细信息'")
    print("   • '将 video.mp4 从第10秒开始剪切30秒'")
    print("   • '合并 video1.mp4 和 video2.mp4'")
    print("   • '将 video.mp4 缩放到 1920x1080'")
    print()
    print("3. 🚀 快速操作:")
    print("   • 选择文件后使用右侧的快速操作按钮")
    print("   • 支持视频信息、剪切、合并、缩放等")
    print()
    print("4. 📁 文件管理:")
    print("   • 拖拽上传视频文件")
    print("   • 查看上传和输出文件")
    print("   • 下载和删除文件")


def main():
    """主函数"""
    print_banner()
    
    # 检查文件
    if not check_files():
        print("\n❌ 请确保所有必要文件都存在后再运行")
        return
    
    # 创建目录
    create_sample_video()
    
    # 显示使用指南
    show_usage_guide()
    
    print("\n" + "=" * 80)
    print("🚀 准备启动 Web 应用...")
    print("📍 服务地址: http://localhost:8000")
    print("🔧 API 文档: http://localhost:8000/docs")
    print("⏹️  按 Ctrl+C 停止服务")
    print("=" * 80)
    
    # 询问是否启动
    try:
        choice = input("\n是否现在启动 Web 应用? (y/n): ").strip().lower()
        if choice in ['y', 'yes', '是', '']:
            print("\n🚀 正在启动...")
            
            # 延迟一下让用户看到消息
            time.sleep(1)
            
            # 启动应用
            os.system("python app.py")
        else:
            print("\n👋 您可以稍后运行以下命令启动应用:")
            print("   python app.py")
            print("   或者")
            print("   python start_web.py")
    
    except KeyboardInterrupt:
        print("\n\n👋 再见!")


if __name__ == "__main__":
    main() 