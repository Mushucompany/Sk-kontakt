Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = 'Stop'

function New-RoundedPath([float]$x,[float]$y,[float]$w,[float]$h,[float]$r) {
  $p = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2.0
  $p.AddArc($x, $y, $d, $d, 180, 90)
  $p.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $p.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $p.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $p.CloseFigure()
  return $p
}

$size = 512
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$g.Clear([System.Drawing.Color]::Transparent)

# Blue gradient background (rounded app-icon square)
$rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, [System.Drawing.Color]::FromArgb(255, 100, 181, 255), [System.Drawing.Color]::FromArgb(255, 9, 85, 196), 52.0)
$bgPath = New-RoundedPath 0 0 $size $size 118
$g.FillPath($bg, $bgPath)

# Chat bubble shadow
$sh = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 0, 0, 0))
$shPath = New-RoundedPath 66 102 388 300 46
$g.FillPath($sh, $shPath)
$sh.Dispose()

# White chat bubble with tail
$white = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$tail = New-Object System.Drawing.Point[] 3
$tail[0] = New-Object System.Drawing.Point(140, 396)
$tail[1] = New-Object System.Drawing.Point(228, 396)
$tail[2] = New-Object System.Drawing.Point(174, 454)
$g.FillPolygon($white, $tail)
$bPath = New-RoundedPath 60 90 392 310 50
$g.FillPath($white, $bPath)

# Draw a word with per-letter Google logo colors, auto-fitted to maxW
function Draw-Word($gObj, $word, $colors, [float]$size, [float]$maxW, [float]$topY) {
  $font = New-Object System.Drawing.Font('Segoe UI', $size, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  function Get-Width($gObj, $word, $font) {
    $t = 0.0
    for ($i = 0; $i -lt $word.Length; $i++) {
      $s = $gObj.MeasureString($word[$i].ToString(), $font)
      $t += $s.Width + 2
    }
    return $t
  }
  $total = Get-Width $gObj $word $font
  while ($total -gt $maxW -and $size -gt 30) {
    $size -= 4
    $font.Dispose()
    $font = New-Object System.Drawing.Font('Segoe UI', $size, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    $total = Get-Width $gObj $word $font
  }
  $x = (512.0 - $total) / 2.0
  for ($i = 0; $i -lt $word.Length; $i++) {
    $c = [System.Drawing.ColorTranslator]::FromHtml($colors[$i])
    $sb = New-Object System.Drawing.SolidBrush($c)
    $ch = $word[$i].ToString()
    $s = $gObj.MeasureString($ch, $font)
    $gObj.DrawString($ch, $font, $sb, $x, $topY)
    $x += $s.Width + 2
    $sb.Dispose()
  }
  $font.Dispose()
}

# "СК"  (С = Google blue, К = Google red)
$w1 = [string][char]0x421 + [char]0x41A
$c1 = @('#4285F4', '#EA4335')
Draw-Word $g $w1 $c1 150 330 128

# "Контакт" (Google rainbow order)
$w2 = [string][char]0x41A + [char]0x43E + [char]0x43D + [char]0x442 + [char]0x430 + [char]0x43A + [char]0x442
$c2 = @('#FBBC05', '#4285F4', '#34A853', '#EA4335', '#FBBC05', '#4285F4', '#EA4335')
Draw-Word $g $w2 $c2 84 332 252

# Save PNG
$out = Join-Path $PSScriptRoot 'logo.png'
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output ('saved: ' + $out)

# Favicon 64x64
$small = New-Object System.Drawing.Bitmap(64, 64)
$sg = [System.Drawing.Graphics]::FromImage($small)
$sg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$sg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$sg.DrawImage($bmp, 0, 0, 64, 64)
$small.Save((Join-Path $PSScriptRoot 'favicon.png'), [System.Drawing.Imaging.ImageFormat]::Png)
Write-Output 'favicon saved'

$g.Dispose(); $bmp.Dispose(); $sg.Dispose(); $small.Dispose()