# ===========================================
# Product Image & Data Downloader
# Generated: 2026-02-26T19:14:50.244Z
# Destination: C:\DBF Nexus\DBF Digital\MoticoSolutionsWebsite\temp
# ===========================================

$dest = "C:\DBF Nexus\DBF Digital\MoticoSolutionsWebsite\temp"
if (!(Test-Path $dest)) { 
    New-Item -ItemType Directory -Path $dest -Force
    Write-Host "Created directory: $dest" -ForegroundColor Green
}

$headers = @{
    'User-Agent' = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    'Accept' = 'image/webp,image/apng,image/*,*/*;q=0.8'
}

Write-Host "Starting image downloads..." -ForegroundColor Cyan


# ============================================
# 1. POLY-PTX 802 HT linear grinder
# ============================================
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/52/60/59/POLY-PTX802HTmitFeinstaub-Schutz.jpg' -OutFile "$dest\poly-ptx-802-ht-linear-grinder_01.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: poly-ptx-802-ht-linear-grinder_01.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: poly-ptx-802-ht-linear-grinder_01.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/11/20/9d/POLY-PTX802HTSatiniermaschineSet.jpg' -OutFile "$dest\poly-ptx-802-ht-linear-grinder_02.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: poly-ptx-802-ht-linear-grinder_02.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: poly-ptx-802-ht-linear-grinder_02.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/a9/a4/90/POLY-PTX802HTSatiniermaschineSeite.jpg' -OutFile "$dest\poly-ptx-802-ht-linear-grinder_03.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: poly-ptx-802-ht-linear-grinder_03.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: poly-ptx-802-ht-linear-grinder_03.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/74/b1/b3/POLY-PTX802HT3DModell.jpg' -OutFile "$dest\poly-ptx-802-ht-linear-grinder_04.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: poly-ptx-802-ht-linear-grinder_04.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: poly-ptx-802-ht-linear-grinder_04.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/25/22/f5/POLY-PTX802HTLngsschliff.jpg' -OutFile "$dest\poly-ptx-802-ht-linear-grinder_05.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: poly-ptx-802-ht-linear-grinder_05.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: poly-ptx-802-ht-linear-grinder_05.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/a6/a6/b2/POLY-PTX802HTSatinieren.jpg' -OutFile "$dest\poly-ptx-802-ht-linear-grinder_06.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: poly-ptx-802-ht-linear-grinder_06.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: poly-ptx-802-ht-linear-grinder_06.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/2b/82/02/POLY-PTX802HTmitVLIES-TOP-Rad.jpg' -OutFile "$dest\poly-ptx-802-ht-linear-grinder_07.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: poly-ptx-802-ht-linear-grinder_07.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: poly-ptx-802-ht-linear-grinder_07.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/3e/86/57/POLY-PTX802HTmitExpansionwalze.jpg' -OutFile "$dest\poly-ptx-802-ht-linear-grinder_08.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: poly-ptx-802-ht-linear-grinder_08.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: poly-ptx-802-ht-linear-grinder_08.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/d1/1d/8e/POLY-PTX802HTperfekterSpiegelglanz.jpg' -OutFile "$dest\poly-ptx-802-ht-linear-grinder_09.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: poly-ptx-802-ht-linear-grinder_09.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: poly-ptx-802-ht-linear-grinder_09.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/75/38/ef/POLY-PTX802HTVorteile.jpg' -OutFile "$dest\poly-ptx-802-ht-linear-grinder_10.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: poly-ptx-802-ht-linear-grinder_10.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: poly-ptx-802-ht-linear-grinder_10.jpg - $_" -ForegroundColor Red
}

# ============================================
# 2. ROHR MAX 802 HT belt grinder for pipes
# ============================================
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/b6/c2/47/ROHRMAX802HTRohrbandschleifer.jpg' -OutFile "$dest\rohr-max-802-ht-belt-grinder-for-pipe_01.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: rohr-max-802-ht-belt-grinder-for-pipe_01.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: rohr-max-802-ht-belt-grinder-for-pipe_01.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/be/a6/7d/ROHRMAX802HTGrundset.jpg' -OutFile "$dest\rohr-max-802-ht-belt-grinder-for-pipe_02.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: rohr-max-802-ht-belt-grinder-for-pipe_02.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: rohr-max-802-ht-belt-grinder-for-pipe_02.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/23/f0/14/ROHRMAX802HTidealfrgroeRohre.jpg' -OutFile "$dest\rohr-max-802-ht-belt-grinder-for-pipe_03.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: rohr-max-802-ht-belt-grinder-for-pipe_03.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: rohr-max-802-ht-belt-grinder-for-pipe_03.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/7d/6e/64/ROHRMAX802HTGasdruckdmpfer.jpg' -OutFile "$dest\rohr-max-802-ht-belt-grinder-for-pipe_04.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: rohr-max-802-ht-belt-grinder-for-pipe_04.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: rohr-max-802-ht-belt-grinder-for-pipe_04.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/7a/9a/50/ROHRMAX802HTimEinsatz.jpg' -OutFile "$dest\rohr-max-802-ht-belt-grinder-for-pipe_05.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: rohr-max-802-ht-belt-grinder-for-pipe_05.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: rohr-max-802-ht-belt-grinder-for-pipe_05.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/00/13/d5/ROHRMAX802HTVorteile.jpg' -OutFile "$dest\rohr-max-802-ht-belt-grinder-for-pipe_06.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: rohr-max-802-ht-belt-grinder-for-pipe_06.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: rohr-max-802-ht-belt-grinder-for-pipe_06.jpg - $_" -ForegroundColor Red
}

# ============================================
# 3. GLADIUS 1802 HT the multifunctional grinding sword
# ============================================
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/b6/a3/2e/GLADIUS1802HTdasmultifunktionaleSchleifschwert.jpg' -OutFile "$dest\gladius-1802-ht-multifunctional-grinding-sword_01.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: gladius-1802-ht-multifunctional-grinding-sword_01.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: gladius-1802-ht-multifunctional-grinding-sword_01.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/5f/25/a2/GLADIUS1802HTGrundset.jpg' -OutFile "$dest\gladius-1802-ht-multifunctional-grinding-sword_02.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: gladius-1802-ht-multifunctional-grinding-sword_02.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: gladius-1802-ht-multifunctional-grinding-sword_02.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/a6/64/f1/GLADIUS1802HTSeitenansicht.jpg' -OutFile "$dest\gladius-1802-ht-multifunctional-grinding-sword_03.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: gladius-1802-ht-multifunctional-grinding-sword_03.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: gladius-1802-ht-multifunctional-grinding-sword_03.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/b1/9b/33/GLADIUS1802HT3DModell.jpg' -OutFile "$dest\gladius-1802-ht-multifunctional-grinding-sword_04.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: gladius-1802-ht-multifunctional-grinding-sword_04.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: gladius-1802-ht-multifunctional-grinding-sword_04.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/af/5e/e4/GLADIUS1802HTfrexaktePlanflchen.jpg' -OutFile "$dest\gladius-1802-ht-multifunctional-grinding-sword_05.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: gladius-1802-ht-multifunctional-grinding-sword_05.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: gladius-1802-ht-multifunctional-grinding-sword_05.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/4a/f5/1f/GLADIUS1802HTPlanschliffanRohrenden.jpg' -OutFile "$dest\gladius-1802-ht-multifunctional-grinding-sword_06.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: gladius-1802-ht-multifunctional-grinding-sword_06.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: gladius-1802-ht-multifunctional-grinding-sword_06.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/f4/24/c9/GLADIUS1802HTDurchbruchausschleifen.jpg' -OutFile "$dest\gladius-1802-ht-multifunctional-grinding-sword_07.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: gladius-1802-ht-multifunctional-grinding-sword_07.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: gladius-1802-ht-multifunctional-grinding-sword_07.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/ea/d1/e2/GLADIUS1802HTPlanflcheanbringen.jpg' -OutFile "$dest\gladius-1802-ht-multifunctional-grinding-sword_08.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: gladius-1802-ht-multifunctional-grinding-sword_08.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: gladius-1802-ht-multifunctional-grinding-sword_08.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/de/ac/7d/GLADIUS1802HTzumKlingenschleifen.jpg' -OutFile "$dest\gladius-1802-ht-multifunctional-grinding-sword_09.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: gladius-1802-ht-multifunctional-grinding-sword_09.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: gladius-1802-ht-multifunctional-grinding-sword_09.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/16/ee/5e/GLADIUS1802HTVorteile.jpg' -OutFile "$dest\gladius-1802-ht-multifunctional-grinding-sword_10.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: gladius-1802-ht-multifunctional-grinding-sword_10.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: gladius-1802-ht-multifunctional-grinding-sword_10.jpg - $_" -ForegroundColor Red
}

# ============================================
# 4. BAND-IT 1100 Power file
# ============================================
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/fa/87/c6/BAND-IT1100Bandfeile.jpg' -OutFile "$dest\band-it-1100-power-file_01.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: band-it-1100-power-file_01.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: band-it-1100-power-file_01.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/f1/8d/db/BAND-IT1100BandfeileSeitenansicht.jpg' -OutFile "$dest\band-it-1100-power-file_02.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: band-it-1100-power-file_02.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: band-it-1100-power-file_02.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/41/3c/6a/BAND-IT1100PowerfeilemitkompaktenSchleifarm.jpg' -OutFile "$dest\band-it-1100-power-file_03.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: band-it-1100-power-file_03.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: band-it-1100-power-file_03.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/80/85/8c/BAND-IT1100PowerfeileidealfrArbeitenanengenStellen.jpg' -OutFile "$dest\band-it-1100-power-file_04.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: band-it-1100-power-file_04.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: band-it-1100-power-file_04.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/4b/30/83/BAND-IT1100Schleiftsehrexakt.jpg' -OutFile "$dest\band-it-1100-power-file_05.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: band-it-1100-power-file_05.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: band-it-1100-power-file_05.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/7c/5c/83/BAND-IT1100PowerfeileidealfrArbeitenanengenStellenPB8TG8vONxACC.jpg' -OutFile "$dest\band-it-1100-power-file_06.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: band-it-1100-power-file_06.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: band-it-1100-power-file_06.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/44/2c/00/BAND-IT1100PowerfeileVorteile.jpg' -OutFile "$dest\band-it-1100-power-file_07.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: band-it-1100-power-file_07.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: band-it-1100-power-file_07.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/f0/06/7b/BAND-IT1100Feinstaubschutzkappe.jpg' -OutFile "$dest\band-it-1100-power-file_08.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: band-it-1100-power-file_08.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: band-it-1100-power-file_08.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/44/cf/12/BAND-IT1100Federspanner.jpg' -OutFile "$dest\band-it-1100-power-file_09.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: band-it-1100-power-file_09.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: band-it-1100-power-file_09.jpg - $_" -ForegroundColor Red
}

# ============================================
# 5. MINI MAX 1100 multifunctional grinder
# ============================================
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/90/39/17/MINIMAX1100drehzahlgeregelterMultifunktionsschleifermit1100Wattfeu7duL8chj9n.jpg' -OutFile "$dest\mini-max-1100-multifunctional-grinder_01.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: mini-max-1100-multifunctional-grinder_01.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: mini-max-1100-multifunctional-grinder_01.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/a5/82/f3/MINIMAX1100SeitenansichtmH0oYfuCzM67y.jpg' -OutFile "$dest\mini-max-1100-multifunctional-grinder_02.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: mini-max-1100-multifunctional-grinder_02.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: mini-max-1100-multifunctional-grinder_02.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/07/f6/e8/MINIMAX1100MultifunktionsschleifermitVerlngerungsarmW5NIZ0Ztz6xPr.jpg' -OutFile "$dest\mini-max-1100-multifunctional-grinder_03.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: mini-max-1100-multifunctional-grinder_03.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: mini-max-1100-multifunctional-grinder_03.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/0b/c2/86/MINIMAX1100MultifunktionsschleifermitExpansionswalzeundZirkonhlseGE7EFOnMlrHM7.jpg' -OutFile "$dest\mini-max-1100-multifunctional-grinder_04.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: mini-max-1100-multifunctional-grinder_04.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: mini-max-1100-multifunctional-grinder_04.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/91/d1/aa/MINIMAX1100MultifunktionsschleifermitMINIFIXSttztellerundFcherschleifscheibetduimNlTKw6fj.jpg' -OutFile "$dest\mini-max-1100-multifunctional-grinder_05.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: mini-max-1100-multifunctional-grinder_05.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: mini-max-1100-multifunctional-grinder_05.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/82/7e/b2/MINIMAX1100VorteilepVVdYk14h16Ny.jpg' -OutFile "$dest\mini-max-1100-multifunctional-grinder_06.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: mini-max-1100-multifunctional-grinder_06.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: mini-max-1100-multifunctional-grinder_06.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/e2/25/6f/MINIMAX1100Feinstaubschutzkappe.jpg' -OutFile "$dest\mini-max-1100-multifunctional-grinder_07.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: mini-max-1100-multifunctional-grinder_07.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: mini-max-1100-multifunctional-grinder_07.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/c3/89/8b/MINIMAX1100Grundset.jpg' -OutFile "$dest\mini-max-1100-multifunctional-grinder_08.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: mini-max-1100-multifunctional-grinder_08.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: mini-max-1100-multifunctional-grinder_08.jpg - $_" -ForegroundColor Red
}

# ============================================
# 6. VARILEX WSF 1100 compact angle grinder
# ============================================
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/5d/b3/03/VARILEX1100kompakterdrehzahlgeregelterEinhandwinkelschleiferhejHGp1CDnW4c.jpg' -OutFile "$dest\varilex-wsf-1100-compact-angle-grinder_01.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: varilex-wsf-1100-compact-angle-grinder_01.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: varilex-wsf-1100-compact-angle-grinder_01.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/e8/27/ef/VARILEX1100EinhandwinkelschleiferSeitenansichtErmhBi4lAZQiA.jpg' -OutFile "$dest\varilex-wsf-1100-compact-angle-grinder_02.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: varilex-wsf-1100-compact-angle-grinder_02.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: varilex-wsf-1100-compact-angle-grinder_02.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/0d/2c/a5/VARILEX1100Einhandwinkelschleifer.jpg' -OutFile "$dest\varilex-wsf-1100-compact-angle-grinder_03.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: varilex-wsf-1100-compact-angle-grinder_03.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: varilex-wsf-1100-compact-angle-grinder_03.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/0d/36/17/VARILEX1100idealfrTRIMFIXMustangFcherschleifscheibeL81LPMKSfaeAz.jpg' -OutFile "$dest\varilex-wsf-1100-compact-angle-grinder_04.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: varilex-wsf-1100-compact-angle-grinder_04.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: varilex-wsf-1100-compact-angle-grinder_04.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/0c/85/5f/PrziseTrennschnittemitVARILEX1100WinkelschleiferundMAGNUMPRECICUTTrennscheibepWlfkuCF9nme8.jpg' -OutFile "$dest\varilex-wsf-1100-compact-angle-grinder_05.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: varilex-wsf-1100-compact-angle-grinder_05.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: varilex-wsf-1100-compact-angle-grinder_05.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/65/19/6b/VARILEX1100idealfrEdelstahlbearbeit.jpg' -OutFile "$dest\varilex-wsf-1100-compact-angle-grinder_06.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: varilex-wsf-1100-compact-angle-grinder_06.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: varilex-wsf-1100-compact-angle-grinder_06.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/e3/f6/3c/VARILEX1100WinkelschleiferVorteile.jpg' -OutFile "$dest\varilex-wsf-1100-compact-angle-grinder_07.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: varilex-wsf-1100-compact-angle-grinder_07.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: varilex-wsf-1100-compact-angle-grinder_07.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://www.eisenblaetter.de/media/image/94/73/6d/VARILEX1100serienmigmitFeinstaubschutzkappe.jpg' -OutFile "$dest\varilex-wsf-1100-compact-angle-grinder_08.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: varilex-wsf-1100-compact-angle-grinder_08.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: varilex-wsf-1100-compact-angle-grinder_08.jpg - $_" -ForegroundColor Red
}

# ============================================
# 7. ASN100
# ============================================
try {
    Invoke-WebRequest -Uri 'https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2022/5/17/1655440475287/146-ASN100.jpg' -OutFile "$dest\dca-asn100_01.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: dca-asn100_01.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: dca-asn100_01.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2022/5/17/1655440482209/146-ASN100.jpg' -OutFile "$dest\dca-asn100_02.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: dca-asn100_02.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: dca-asn100_02.jpg - $_" -ForegroundColor Red
}

# ============================================
# 8. ASS150
# ============================================
try {
    Invoke-WebRequest -Uri 'https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2023/8/18/1694999360511/150-ASS150.jpg' -OutFile "$dest\dca-ass150_01.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: dca-ass150_01.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: dca-ass150_01.jpg - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2023/8/18/1694999369103/150-ASS150.jpg' -OutFile "$dest\dca-ass150_02.jpg" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: dca-ass150_02.jpg" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: dca-ass150_02.jpg - $_" -ForegroundColor Red
}

# ============================================
# 9. ASM18-115
# ============================================
try {
    Invoke-WebRequest -Uri 'https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2024/11/6/1733465849979/ASM18-100%26115%E6%9C%89%E8%BE%85%E5%8A%A9%E6%89%8B%E6%9F%84.png' -OutFile "$dest\dca-asm18-115_01.png" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: dca-asm18-115_01.png" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: dca-asm18-115_01.png - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2024/11/6/1733465857430/ASM18-100%26115%E6%9C%89%E8%BE%85%E5%8A%A9%E6%89%8B%E6%9F%84.png' -OutFile "$dest\dca-asm18-115_02.png" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: dca-asm18-115_02.png" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: dca-asm18-115_02.png - $_" -ForegroundColor Red
}

# ============================================
# 10. ASM04-125
# ============================================
try {
    Invoke-WebRequest -Uri 'https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2024/10/29/1732861041994/ASM04-125.png' -OutFile "$dest\dca-asm04-125_01.png" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: dca-asm04-125_01.png" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: dca-asm04-125_01.png - $_" -ForegroundColor Red
}
try {
    Invoke-WebRequest -Uri 'https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2024/10/29/1732861062473/ASM04-125.png' -OutFile "$dest\dca-asm04-125_02.png" -Headers $headers -ErrorAction Stop
    Write-Host "  OK: dca-asm04-125_02.png" -ForegroundColor Green
} catch {
    Write-Host "  FAIL: dca-asm04-125_02.png - $_" -ForegroundColor Red
}

Write-Host "
All downloads complete!" -ForegroundColor Cyan
Write-Host "Files saved to: $dest" -ForegroundColor Green
