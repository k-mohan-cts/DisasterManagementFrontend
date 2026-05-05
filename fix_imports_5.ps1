$baseDir = 'c:\Users\2478144\OneDrive - Cognizant\Documents\DisasterFrontend_new\Angular\src\app\components'
$files = Get-ChildItem -Path $baseDir -Recurse -Filter '*.ts'

foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw
    if ($content -match "import\s*\{\s*SidebarComponent\s*\}\s*from") {
        $relPath = $f.FullName.Substring($baseDir.Length + 1)
        $depth = ($relPath -split '\\').Count - 1
        
        $upDots = ''
        for ($i = 0; $i -lt $depth; $i++) {
            $upDots += '../'
        }
        
        $correctImport = "import { SidebarComponent } from '$upDotsshared/sidebar/sidebar.component';"
        
        $newContent = $content -replace "import\s*\{\s*SidebarComponent\s*\}\s*from\s*['"][^\n\r]*['"];?", $correctImport
        
        if ($newContent -ne $content) {
            [System.IO.File]::WriteAllText($f.FullName, $newContent)
            Write-Host "Fixed: $($f.FullName) -> $correctImport"
        }
    }
}
