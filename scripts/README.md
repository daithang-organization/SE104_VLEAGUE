<h1 align="center">🛠️ Scripts</h1>

<p align="center">
  <strong>Các script tiện ích cho dự án VLeague</strong>
</p>

---

## 📋 Mục lục

- [🎯 Tổng quan](#-tổng-quan)
- [📁 Danh sách Scripts](#-danh-sách-scripts)
- [🚀 Cách sử dụng](#-cách-sử-dụng)
- [➕ Thêm Script mới](#-thêm-script-mới)

---

## 🎯 Tổng quan

Thư mục `scripts/` chứa các script tiện ích giúp:
- Tự động hóa các tác vụ lặp đi lặp lại
- Setup môi trường development
- Build và deploy
- Database management
- Các utility scripts khác

---

## 📁 Danh sách Scripts

> 📝 **Note:** Thư mục này hiện đang được phát triển. Các scripts sẽ được thêm vào khi cần thiết.

### Scripts dự kiến

| Script | Mô tả | Trạng thái |
|--------|-------|------------|
| `setup.sh` | Cài đặt môi trường development | 🔜 Planned |
| `reset-db.sh` | Reset database về trạng thái ban đầu | 🔜 Planned |
| `seed-data.sh` | Seed dữ liệu mẫu | 🔜 Planned |
| `backup-db.sh` | Backup database | 🔜 Planned |
| `generate-api-docs.sh` | Generate API documentation | 🔜 Planned |

---

## 🚀 Cách sử dụng

### Windows (PowerShell)

```powershell
# Chạy script PowerShell
.\scripts\setup.ps1

# Hoặc với execution policy
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\scripts\setup.ps1
```

### Linux/macOS (Bash)

```bash
# Cấp quyền thực thi
chmod +x scripts/setup.sh

# Chạy script
./scripts/setup.sh
```

---

## ➕ Thêm Script mới

### Template cho Bash Script

```bash
#!/bin/bash

# ============================================
# Script: script-name.sh
# Description: Mô tả ngắn về script
# Author: Tên tác giả
# ============================================

set -e  # Dừng nếu có lỗi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Main
main() {
    log_info "Starting script..."
    
    # Your code here
    
    log_info "Done!"
}

main "$@"
```

### Template cho PowerShell Script

```powershell
# ============================================
# Script: script-name.ps1
# Description: Mô tả ngắn về script
# Author: Tên tác giả
# ============================================

param(
    [switch]$Help,
    [string]$Param1
)

# Functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Err {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Show-Help {
    Write-Host @"
Usage: .\script-name.ps1 [-Help] [-Param1 <value>]

Options:
    -Help       Show this help message
    -Param1     Description of param1
"@
}

# Main
function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    Write-Info "Starting script..."
    
    # Your code here
    
    Write-Info "Done!"
}

Main
```

---

## 📂 Tổ chức thư mục

```
scripts/
├── README.md           # File này
├── setup/              # Scripts cài đặt
│   ├── setup.sh
│   └── setup.ps1
├── database/           # Scripts database
│   ├── reset-db.sh
│   ├── seed-data.sh
│   └── backup-db.sh
└── utils/              # Scripts tiện ích
    └── generate-docs.sh
```

---

## 📝 Quy tắc viết Script

### 1. Naming Convention
- Sử dụng `kebab-case` cho tên file
- Đuôi `.sh` cho Bash, `.ps1` cho PowerShell
- Tên mô tả rõ chức năng

### 2. Documentation
- Thêm header comment với mô tả
- Thêm help option (-h, --help)
- Comment cho các đoạn code phức tạp

### 3. Error Handling
- Sử dụng `set -e` trong Bash
- Catch errors và hiển thị message rõ ràng
- Exit với code phù hợp (0 = success, >0 = error)

### 4. Logging
- Sử dụng colors để phân biệt log levels
- INFO (green), WARN (yellow), ERROR (red)

---

## 📚 Tài liệu liên quan

- [Bash Scripting Guide](https://www.gnu.org/software/bash/manual/bash.html)
- [PowerShell Documentation](https://docs.microsoft.com/en-us/powershell/)
- [CONTRIBUTING.md](../docs/CONTRIBUTING.md) - Hướng dẫn đóng góp

---

<p align="center">
  <strong>Utility Scripts 🛠️</strong>
</p>
