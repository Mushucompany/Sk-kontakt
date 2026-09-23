Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

$src = [System.Drawing.Image]::FromFile((Join-Path $PSScriptRoot 'logo.png'))
$icoPath = Join-Path $PSScriptRoot 'app.ico'

$stream = [System.IO.File]::OpenWrite($icoPath)
$writer = New-Object System.IO.BinaryWriter($stream)

# ICO header
$writer.Write([byte]0)
$writer.Write([byte]0)
$writer.Write([int16]1)  # ICO type
$writer.Write([int16]1)  # 1 image

# Directory entry for 64x64
$w = 64
$h = 64
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.DrawImage($src, 0, 0, $w, $h)
$g.Dispose()

$ms = New-Object System.IO.MemoryStream
$bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
$pngBytes = $ms.ToArray()
$ms.Dispose()
$bmp.Dispose()

# Directory entry
$icoSize = 22 + $pngBytes.Length
$writer.Write([byte](64))
$writer.Write([byte](64))
$writer.Write([byte]0)   # colors
$writer.Write([byte]0)   # reserved
$writer.Write([int16]1)  # planes
$writer.Write([int16]32) # bpp
$writer.Write([int32]$pngBytes.Length)
$writer.Write([int32]22) # offset (after header+dir)

# PNG data
$writer.Write($pngBytes)
$writer.Dispose()
$stream.Dispose()
$src.Dispose()

Write-Output "ICO saved: $icoPath"