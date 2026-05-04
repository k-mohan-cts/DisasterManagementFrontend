$baseDir = 'c:\Users\2478144\OneDrive - Cognizant\Documents\DisasterFrontend_new\Angular\src\app\components'
$files = Get-ChildItem -Path $baseDir -Recurse -Filter '*.ts'

foreach ($f in $files) {
    $relPath = $f.FullName.Substring($baseDir.Length + 1)
    $depth = ($relPath -split '\\').Count - 1
    
    $upDots = ''
    for ($i = 0; $i -lt $depth; $i++) {
        $upDots += '../'
    }
    
    $correctImport = "import { SidebarComponent } from '$upDotsshared/sidebar/sidebar.component';"
    
    $content = Get-Content $f.FullName
    $changed = $false
    for ($i = 0; $i -lt $content.Count; $i++) {
        if ($content[$i] -match "import \{ SidebarComponent \} from '.*shared/sidebar/sidebar\.component';") {
            if ($content[$i].Trim() -ne $correctImport.Trim()) {
                $content[$i] = $correctImport
                $changed = $true
            }
        }
    }
    
    if ($changed) {
        Set-Content -Path $f.FullName -Value $content
        Write-Host "Fixed: $($f.FullName)"
    }
}
