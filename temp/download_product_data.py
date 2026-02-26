#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Product Image & Data Downloader
Target: C:/DBF Nexus/DBF Digital/MoticoSolutionsWebsite/temp
Generated: 2026-02-26T19:24:12.939Z
"""
import os, json, requests
from pathlib import Path

DEST = Path(r"C:/DBF Nexus/DBF Digital/MoticoSolutionsWebsite/temp")
DEST.mkdir(parents=True, exist_ok=True)

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

PRODUCTS = [
    {
        "id": 1,
        "slug": "poly-ptx-802-ht-linear-grinder",
        "title": "POLY-PTX 802 HT linear grinder",
        "subtitle": "",
        "description": "Product information \"POLY-PTX 802 HT linear grinder\"\n\nThe inventor of the hand-held linear grinding machine is introducing a refinement of its familiar POLY-PTX® series, starting immediately.\nThe POLY-PTX® 802 HT (high torque) linear grinder offers a torque and performance profile that is so far unmatched. The newly developed planetary gear distributes traction across additional gear wheels in a sophisticated arrangement, greatly increasing all drive components’ resistance to wear and making the professional device a continuous runner. Eisenblätter has also refined the shaft handle, offering it with new, rubberised inserts that provide an especially good grip and optimal handling during linear grinding, satin finishing, or polishing, ensuring uniform grinding results that are entirely free of shadows.\nThe drive spindle is of corrosion-free stainless steel. All grinding tools can be manually attached without screws by means of a self-centring knurled screw – now with rotary protection. Even the protective cover for the grinding rollers has been significantly improved and is of robust, precise aluminium pressure casting to which the optional suction cover with its suction sockets can be added. Special attention has been paid to the hose guide, which provides free lateral space during work. An additional retractable polycarbonate cover protects the eyes from flying particles during use of the extrawide grinding rollers (up to 150 mm) from our Eco Smart system.\nThe new POLY-PTX® 802 HT has been designed for long service life and value preservation and represents a new level of quality and performance in linear grinding machines.\nFeatures:\n\nShadow-free satin finishing, brushing, polishing of all metals (stainless steel to non-ferrous metals) to wood.\nRemoves weld seams, deep scratches, rust, dirt, paint, and oxide layers.\nExtremely powerful, durable motor of 1,750 W with a sophisticated planetary gear for maximum power transmission and torque (high torque) throughout the speed range, 820-3,000 rpm with a tacho-generator for constant speeds, even under load – made entirely in Germany.\nNew, especially ergonomic shaft handle for optimal grinding roller handling.\nPlanetary gear delivers maximum torque and preserves value.\n19 mm stainless steel drive shaft with double splines across the entire length of the spindle for grinding rollers of up to 115 mm in diameter and 100 mm working width (milled fleece wheels of up to 110 mm) – with the Eco Smart adapter, up to 150 mm working width.\nLarge grinding tool range for decorative surface finishing.\nVery fine grinding on large surface areas thanks to the oscillating grinding movement.\nMachine weight only 2.8 kg.\nThe optional grinding belt roller allows use as a pipe grinder, even on closed pipe constructions.\n\nContents:\n1 POLY-PTX® 802 HT basic machine\n1 particulate matter protection cap\n1 robust, impact-resistant plastic case\n1 new POLY-PTX® tightening screw\n1 fleece wheel\n1 expansion roller\n1 zirconium sleeve\n1 ",
        "source": "eisenblaetter.de",
        "images": [
            "https://www.eisenblaetter.de/media/image/52/60/59/POLY-PTX802HTmitFeinstaub-Schutz.jpg",
            "https://www.eisenblaetter.de/media/image/11/20/9d/POLY-PTX802HTSatiniermaschineSet.jpg",
            "https://www.eisenblaetter.de/media/image/a9/a4/90/POLY-PTX802HTSatiniermaschineSeite.jpg",
            "https://www.eisenblaetter.de/media/image/74/b1/b3/POLY-PTX802HT3DModell.jpg",
            "https://www.eisenblaetter.de/media/image/25/22/f5/POLY-PTX802HTLngsschliff.jpg",
            "https://www.eisenblaetter.de/media/image/a6/a6/b2/POLY-PTX802HTSatinieren.jpg",
            "https://www.eisenblaetter.de/media/image/2b/82/02/POLY-PTX802HTmitVLIES-TOP-Rad.jpg",
            "https://www.eisenblaetter.de/media/image/3e/86/57/POLY-PTX802HTmitExpansionwalze.jpg",
            "https://www.eisenblaetter.de/media/image/d1/1d/8e/POLY-PTX802HTperfekterSpiegelglanz.jpg",
            "https://www.eisenblaetter.de/media/image/75/38/ef/POLY-PTX802HTVorteile.jpg"
        ]
    },
    {
        "id": 2,
        "slug": "rohr-max-802-ht-belt-grinder-for-pipe",
        "title": "ROHR MAX 802 HT belt grinder for pipes",
        "subtitle": "",
        "description": "Product information \"ROHR MAX 802 HT belt grinder for pipes\"\n\nMultifunctional, gas pressure-damped pipe belt sander for perfect sanding and polishing of closed and open pipe constructions. From small to large pipe diameters.\nThanks to a newly developed planetary gear, the frictional connection is now distributed over three additional, cleverly arranged gears. This dramatically increases longevity and pulling power.\nSignificantly improved air flow technology with turbo fan, and heavily encapsulated armature and field windings bring a power pack to light that is second to none.\nFeatures:\n\nBelt dimensions 40 x 780 mm.\nIdeal for pipes with a diameter of 40 - 130 mm. Can also be used for other diameters.\nExtremely powerful and durable motor with 1,750 watts  and new HT (High Torque) gear mechanism for wear-resistant power transmission\n100% Made in Germany.\nMaximum torque thanks to planetary gears in the entire speed range from 820 - 3,000 rpm  (belt speed 4 to 14 m / sec) with tachometer generator for constant speed even under load.\nParticularly robust and kink-proof cable guarantees a long service life.\nHomogeneous, even grinding and polishing result for all pipe diameters,  regardless of whether small or large.\nPatented damping concept with gas pressure damper enables maximum “tube enclosure” of the grinding and polishing belts without great effort.\nOptional: Completely wear-free spring damping concept enables maximum “tube enclosure” of the grinding and polishing belts without great effort.\nNew type of drive roller  with exchangeable rubber O-rings guarantees slip-free belt run.\nDeflection roller made of soft PUR material for  particularly soft placement and permanent elasticity  also enables the longitudinal sanding of flat surfaces such as spot weld removal, deep scratch removal, etc.\nQuick and easy belt change.\nNo readjustment necessary.  Ideal tape guidance through  side VA fittings.\nBalanced and multi-adjustable handle  enables optimal adaptation to the respective work situation.\nAdjustable for  right and left hand operation  or for side and overhead work.\nThe  belt unit made of aluminum chill casting  is particularly robust and resistant.\nParticularly flexible and easy to use.\n\nSet content:\n1 ROHR MAX® 802 HT basic device\n1 pre-installed fine dust protection cap\n3 replacement rubber O-rings\n3 special zircon bands 40 x 780 mm\n1 special SC fleece tape 40 x 780 mm\n \n\nDevice type:\nBelt grinder\n\nCable / Battery:\ncable\n\nSuitable tools:\nBelts\n\nPlug type / mains connection:\nEU (C+F) 220 - 240 volts ~ 50 - 60 Hz, GB (G) 110 - 120 volts ~ 50 - 60 Hz\n\nPower consumption:\n1750 watts\n\nMax. tool dimension:\nBelts 40 x 780 mm\n\nTool mount:\nBelts 40 x 780 mm\n\nWEEE-Reg.-No.:\nDE 51395731\n\nSpeed in min-1:\n820 - 3.000\n\nDimensions:\n670 x 195 x 235 mm\n\nRelated links to \"ROHR MAX 802 HT belt grinder for pipes\"\n\n Do you have any questions concerning this product?\n\n Further products by Gerd Eisenblätter GmbH\n\nAvailable downloads:\n\n Download Bedienungsanleitung ROHR MAX ",
        "source": "eisenblaetter.de",
        "images": [
            "https://www.eisenblaetter.de/media/image/b6/c2/47/ROHRMAX802HTRohrbandschleifer.jpg",
            "https://www.eisenblaetter.de/media/image/be/a6/7d/ROHRMAX802HTGrundset.jpg",
            "https://www.eisenblaetter.de/media/image/23/f0/14/ROHRMAX802HTidealfrgroeRohre.jpg",
            "https://www.eisenblaetter.de/media/image/7d/6e/64/ROHRMAX802HTGasdruckdmpfer.jpg",
            "https://www.eisenblaetter.de/media/image/7a/9a/50/ROHRMAX802HTimEinsatz.jpg",
            "https://www.eisenblaetter.de/media/image/00/13/d5/ROHRMAX802HTVorteile.jpg"
        ]
    },
    {
        "id": 3,
        "slug": "gladius-1802-ht-multifunctional-grinding-sword",
        "title": "GLADIUS 1802 HT the multifunctional grinding sword",
        "subtitle": "",
        "description": "Product information \"GLADIUS 1802 HT the multifunctional grinding sword\"\n\nUnique grinding sword with universal grinding properties, attachable stop system for grinding precise angles and radii.\nCan be used either as a hand-held device or, thanks to the optional, innovative ball-and-socket joint holder, as a stationary machine.\nGrinding, smoothing, deburring, derusting, descaling, sharpening, polishing now with lightning speed with a handy, innovative grinding sword.\nExtra-long work area enables one-sided or two-sided machining, even on workpieces that are difficult to access.\nAlmost all metals, from VA to non-ferrous metals, from plastic, stone to wood, can be processed at lightning speed by simply changing the belt.\nThe GLADIUS® is optimally balanced and can easily replace many common, stationary grinding devices, thanks to its versatility a workshop in the smallest of spaces\nSpace or for mobile use.\nFeatures:\n\nBelt dimensions 40 x 780 mm\nMobile and stationary use:  extremely versatile, for almost all flat grinding and polishing work, on the full extension surface.\nOptional angle attachment  for grinding work at a constant angle, changeable for opposite and off-going belt directions, e.g. knife and tool sharpening.\nOptional table ball joint holder enables stationary use in any angle and position.\nThe tape guide extension arm consists of a new  special alloy for significantly reduced grinding temperatures.\nParticularly simple,  fast changing of belts,  drive roller with inexpensive, exchangeable rubber rings and lateral VA guide cheeks.\nDrive motor extremely powerful and durable, thanks to the revolutionary planetary gearbox,  at 1,750 watts, 800 - 3,100 rpm (belt speed 3 - 10 m / sec).\nTachometer generator for constant speeds even under load.\n\nSet content:\n1 GLADIUS® 1802 HT basic device\n1 pre-installed fine dust protective cap\n4 special zircon bands 40 x 780 mm\n5 replacement rubber O-rings\n\n \n\nDevice type:\nBelt grinder\n\nCable / Battery:\ncable\n\nSuitable tools:\nBelts\n\nPlug type / mains connection:\nEU (C+F) 220 - 240 volts ~ 50 - 60 Hz, GB (G) 110 - 120 volts ~ 50 - 60 Hz\n\nPower consumption:\n1750 watts\n\nMax. tool dimension:\nBelts 40 x 780 mm\n\nTool mount:\nBelts 40 x 780 mm\n\nWEEE-Reg.-No.:\nDE 51395731\n\nSpeed in min-1:\n820 - 3.000\n\nDimensions:\n710 x 215 x 180 mm\n\nRelated links to \"GLADIUS 1802 HT the multifunctional grinding sword\"\n\n Do you have any questions concerning this product?\n\n Further products by Gerd Eisenblätter GmbH\n\nAvailable downloads:\n\n Download Bedienungsanleitung GLADIUS 1802 HT",
        "source": "eisenblaetter.de",
        "images": [
            "https://www.eisenblaetter.de/media/image/b6/a3/2e/GLADIUS1802HTdasmultifunktionaleSchleifschwert.jpg",
            "https://www.eisenblaetter.de/media/image/5f/25/a2/GLADIUS1802HTGrundset.jpg",
            "https://www.eisenblaetter.de/media/image/a6/64/f1/GLADIUS1802HTSeitenansicht.jpg",
            "https://www.eisenblaetter.de/media/image/b1/9b/33/GLADIUS1802HT3DModell.jpg",
            "https://www.eisenblaetter.de/media/image/af/5e/e4/GLADIUS1802HTfrexaktePlanflchen.jpg",
            "https://www.eisenblaetter.de/media/image/4a/f5/1f/GLADIUS1802HTPlanschliffanRohrenden.jpg",
            "https://www.eisenblaetter.de/media/image/f4/24/c9/GLADIUS1802HTDurchbruchausschleifen.jpg",
            "https://www.eisenblaetter.de/media/image/ea/d1/e2/GLADIUS1802HTPlanflcheanbringen.jpg",
            "https://www.eisenblaetter.de/media/image/de/ac/7d/GLADIUS1802HTzumKlingenschleifen.jpg",
            "https://www.eisenblaetter.de/media/image/16/ee/5e/GLADIUS1802HTVorteile.jpg"
        ]
    },
    {
        "id": 4,
        "slug": "band-it-1100-power-file",
        "title": "BAND-IT 1100 Power file",
        "subtitle": "",
        "description": "Product information \"BAND-IT 1100 Power file\"\n\nThe new  BAND-IT 1100  belt file has an even  more robust drive for continuous professional use. \nThe mechanics have been improved again and work particularly  powerful and precise.\nFeatures:\n\nDue to the  compact, narrow design,  ideal for  working in \"tight spaces\"  e. B. possible in edges, folds and corners. Particularly interesting in  railing, apparatus, tool and metal construction.\nFor  sanding and polishing belts  of  5 and 9 mm  width. Belt change in seconds. Quickly exchangeable,  brass pulleys, with high-quality needle roller bearings and rubberized running surfaces.\nSanding and polishing belts  are  automatically  guided and  adjusted.  The pre-tensioning can also be locked using a knurled screw, for firmer contact pressure and precise work.\nBalanced, powerful machine,  1100 watts.\nSpeed controlled from  2,800 - 9,600 min-1 (belt speed 4 - 14 m / sec). \nDamping by  dust-protected spring.\nCan be used mobile or  stationary  e.g. with  table ball joint holder.\n100% Made in Germany.\n\nSet content: \n1 Band-IT 1100 basic device\n1 sturdy, impact-resistant plastic case for machine and accessories\n1 fine dust protection cap\n1 change roll for 9 x 533 mm fleece and polishing belts\n1 change roll for 5 x 533 mm sanding belts\n8 sanding belts 9 x 533 mm\n \n\nDevice type:\nBelt grinder\n\nCable / Battery:\ncable\n\nSuitable tools:\nBelts\n\nPlug type / mains connection:\nEU (C+F) 220 - 240 volts ~ 50 - 60 Hz\n\nMax. tool dimension:\nBelts 9 x 533 mm\n\nTool mount:\nBelts 9  x 533 mm, Belts 9  x 533 mm\n\nPower consumption:\n1100 watts\n\nWEEE-Reg.-No.:\nDE 51395731\n\nSpeed in min-1:\n2.800 - 9.600\n\nDimensions:\n510 x 195 x 165 mm\n\nRelated links to \"BAND-IT 1100 Power file\"\n\n Do you have any questions concerning this product?\n\n Further products by Gerd Eisenblätter GmbH\n\nAvailable downloads:\n\n Download Bedienungsanleitung BAND-IT",
        "source": "eisenblaetter.de",
        "images": [
            "https://www.eisenblaetter.de/media/image/fa/87/c6/BAND-IT1100Bandfeile.jpg",
            "https://www.eisenblaetter.de/media/image/f1/8d/db/BAND-IT1100BandfeileSeitenansicht.jpg",
            "https://www.eisenblaetter.de/media/image/41/3c/6a/BAND-IT1100PowerfeilemitkompaktenSchleifarm.jpg",
            "https://www.eisenblaetter.de/media/image/80/85/8c/BAND-IT1100PowerfeileidealfrArbeitenanengenStellen.jpg",
            "https://www.eisenblaetter.de/media/image/4b/30/83/BAND-IT1100Schleiftsehrexakt.jpg",
            "https://www.eisenblaetter.de/media/image/7c/5c/83/BAND-IT1100PowerfeileidealfrArbeitenanengenStellenPB8TG8vONxACC.jpg",
            "https://www.eisenblaetter.de/media/image/44/2c/00/BAND-IT1100PowerfeileVorteile.jpg",
            "https://www.eisenblaetter.de/media/image/f0/06/7b/BAND-IT1100Feinstaubschutzkappe.jpg",
            "https://www.eisenblaetter.de/media/image/44/cf/12/BAND-IT1100Federspanner.jpg"
        ]
    },
    {
        "id": 5,
        "slug": "mini-max-1100-multifunctional-grinder",
        "title": "MINI MAX 1100 multifunctional grinder",
        "subtitle": "",
        "description": "Product information \"MINI MAX 1100 multifunctional grinder\"\n\nThe new, revised  MINI MAX® 1100  once again promises significantly  more power reserves for continuous professional use.  In addition to the new, powerful, speed-controlled drive motor, the new universal sander shines with significantly  improved dust protection and mechanics.\nThe  speed ranges  have been  expanded  and offer the ideal drive device with the  for a variety of  mini shaft tools (fleece, mop, polisher and much more)  b> perfect longitudinal guidance  for clean, shadow-free surfaces. Thanks to the balanced weight distribution, you can work  completely fatigue-free for many hours.\nFeatures:\n\nParticularly  versatile  and indispensable for  service, repair, assembly, motor vehicles, painting workshops  and much more\nFor sanding tasks in difficult places  (corners, edges, inner containers etc.),  coarse sanding, fine sanding, satin finishing, matt finishing, polishing to a mirror finish, mini angle sanding and cutting sanding.\nIdeal drive motor for flexible shafts  with 6 mm shaft.\nThe working temperature of the grinding arm and the gear head is massively reduced by a new type of air duct system, making the  MINI MAX® 1100  ideally suited for  continuous use.\nIdeal for the Eisenblätter MINI FIX and the Eisenblätter PINLOC system. Also suitable for other systems available on the market such as ROLOC ™, FASTLOCK or similar.\nExtensive range of grinding tools for every grinding task  on  stainless steel, steel, non-ferrous metals, aluminum, wood and plastics.\nCan be used with  ball joint holder  for secure fixing of the drive motor when working with the  flexible shaft  or as a  stationary grinder.\nSwitch-off carbon brushes  to protect the motor.\nFoam rubber handle  for \"soft\", vibration-neutral grinding.\nMade in Germany.\n\nContents:\n1 MINI MAX® 1100 basic device\n1 Robust and impact-resistant plastic case\n1 MINI FIX backing pad\n1 MINI FIX Cool Top® flap disc\n1 fleece wheel with 6 mm shaft\n \n\nDevice type:\nMultifunctional grinder\n\nCable / Battery:\ncable\n\nSuitable tools:\nShaft tools\n\nPlug type / mains connection:\nEU (C+F) 220 - 240 volts ~ 50 - 60 Hz\n\nMax. tool dimension:\nDiameter 75 mm\n\nTool mount:\n6 mm shaft\n\nPower consumption:\n1100 watts\n\nWEEE-Reg.-No.:\nDE 51395731\n\nSpeed in min-1:\n9.400 - 25.200\n\nDimensions:\n420 x 195 x 160 mm\n\nRelated links to \"MINI MAX 1100 multifunctional grinder\"\n\n Do you have any questions concerning this product?\n\n Further products by Gerd Eisenblätter GmbH\n\nAvailable downloads:\n\n Download MINI FIX KLETT Kompass",
        "source": "eisenblaetter.de",
        "images": [
            "https://www.eisenblaetter.de/media/image/90/39/17/MINIMAX1100drehzahlgeregelterMultifunktionsschleifermit1100Wattfeu7duL8chj9n.jpg",
            "https://www.eisenblaetter.de/media/image/a5/82/f3/MINIMAX1100SeitenansichtmH0oYfuCzM67y.jpg",
            "https://www.eisenblaetter.de/media/image/07/f6/e8/MINIMAX1100MultifunktionsschleifermitVerlngerungsarmW5NIZ0Ztz6xPr.jpg",
            "https://www.eisenblaetter.de/media/image/0b/c2/86/MINIMAX1100MultifunktionsschleifermitExpansionswalzeundZirkonhlseGE7EFOnMlrHM7.jpg",
            "https://www.eisenblaetter.de/media/image/91/d1/aa/MINIMAX1100MultifunktionsschleifermitMINIFIXSttztellerundFcherschleifscheibetduimNlTKw6fj.jpg",
            "https://www.eisenblaetter.de/media/image/82/7e/b2/MINIMAX1100VorteilepVVdYk14h16Ny.jpg",
            "https://www.eisenblaetter.de/media/image/e2/25/6f/MINIMAX1100Feinstaubschutzkappe.jpg",
            "https://www.eisenblaetter.de/media/image/c3/89/8b/MINIMAX1100Grundset.jpg"
        ]
    },
    {
        "id": 6,
        "slug": "varilex-wsf-1100-compact-angle-grinder",
        "title": "VARILEX WSF 1100 compact angle grinder",
        "subtitle": "",
        "description": "Product information \"VARILEX WSF 1100 compact angle grinder\"\n\nEisenblätter is now introducing a new, particularly handy compact angle grinder with  1,100 watts of power consumption, variable speed  and new technical features. A  robust slip clutch  is integrated in the device, which prevents a possible jamming of the panes. This means that you can work particularly safely with  VARILEX® 1100. The constant electronics ensure  continuously variable speeds between 2,800 and 9,600 rpm.  The VARILEX® 1100 is ideal  for one- and two-hand work.Grinding is particularly universal and allows - taking into account the speed ranges - a variety of  different surface treatments.\nFeatures:\n\nNew,  compact  angle grinder generation  with the smallest handle circumference in its performance class for  fatigue-free grinding in perfect ergonomics.\n\"Marathon-Motor\"  offers  30% higher power reserves  with up to  50% more torque  compared to comparable devices.\nMaximum service life  thanks to the new internal dust protection seal and external  dust protection cap with replaceable filters.\nIdeal speed range for flap discs  up to Ø 125 mm.\nFull-wave electronics offer constant speeds  of exclusive  2,800 to 9,600 rpm,  ideal for a wide variety of surface processing steps - especially for the use of flap discs.\nToolless adjustable protective hood, can be fixed in place so that it cannot twist.\nMechanical safety clutch  minimizes \"kick-back\" when blocking a disc for  maximum user protection  and rapid further work.\nElectronic overload protection, soft start and restart protection.\nMaintenance-friendly device design - for  carbon brush replacement in seconds.\nSwitch-off carbon brushes  to protect the motor.\nFoam rubber handle  for \"soft\", vibration-neutral grinding.\nMade in Germany. \n\nContent: \n1 VARILEX® 1100 angle grinder\n1 Robust, impact-resistant plastic case\n1 protective cover up to Ø 125 mm\n1 protective cutting disc clip up to Ø 125 mm\n1 clamping nut\n1 wrench\n1 fine dust protection cap\n1 high-performance flap disc Ø 125 mm\n1 Premium cutting disc Ø 125 x 1.0 mm\nNote: Particularly difficult  \"heavy-duty work\"  should naturally be carried out with the  VARILEX® 1802 HT (1,750 watt)  and a higher physical torque. The new  VARILEX® 1100 is the ideal device for medium-heavy work.\n\nTool mount:\nM14 thread\n\nDevice type:\nAngle grinder\n\nCable / Battery:\ncable\n\nSuitable tools:\nDiscs\n\nPlug type / mains connection:\nEU (C+F) 220 - 240 volts ~ 50 - 60 Hz\n\nMax. tool dimension:\nDiameter 125 mm\n\nPower consumption:\n1100 watts\n\nWEEE-Reg.-No.:\nDE 51395731\n\nSpeed in min-1:\n2.800 - 9.600\n\nDimensions:\n240 x 300 x 110 mm\n\nRelated links to \"VARILEX WSF 1100 compact angle grinder\"\n\n Do you have any questions concerning this product?\n\n Further products by Gerd Eisenblätter GmbH",
        "source": "eisenblaetter.de",
        "images": [
            "https://www.eisenblaetter.de/media/image/5d/b3/03/VARILEX1100kompakterdrehzahlgeregelterEinhandwinkelschleiferhejHGp1CDnW4c.jpg",
            "https://www.eisenblaetter.de/media/image/e8/27/ef/VARILEX1100EinhandwinkelschleiferSeitenansichtErmhBi4lAZQiA.jpg",
            "https://www.eisenblaetter.de/media/image/0d/2c/a5/VARILEX1100Einhandwinkelschleifer.jpg",
            "https://www.eisenblaetter.de/media/image/0d/36/17/VARILEX1100idealfrTRIMFIXMustangFcherschleifscheibeL81LPMKSfaeAz.jpg",
            "https://www.eisenblaetter.de/media/image/0c/85/5f/PrziseTrennschnittemitVARILEX1100WinkelschleiferundMAGNUMPRECICUTTrennscheibepWlfkuCF9nme8.jpg",
            "https://www.eisenblaetter.de/media/image/65/19/6b/VARILEX1100idealfrEdelstahlbearbeit.jpg",
            "https://www.eisenblaetter.de/media/image/e3/f6/3c/VARILEX1100WinkelschleiferVorteile.jpg",
            "https://www.eisenblaetter.de/media/image/94/73/6d/VARILEX1100serienmigmitFeinstaubschutzkappe.jpg"
        ]
    },
    {
        "id": 7,
        "slug": "dca-asn100",
        "title": "DCA ASN100",
        "subtitle": "Sander Polisher",
        "description": "ASN100\\nRated Power Input: 1400W\\nNo-load Speed: 690-3800r/min\\nWheel Size: Φ120x100mm\\nNet Weight: 4.7kg\\n\\nFeatures:\\n1. Adjustable speed;\\n2. Electronic constant speed control, maintains constant speed under load.\\n\\nAccessories & Package: Auxiliary Handle, Wrench, Carbon Brush, Color Box Packing",
        "source": "dcatools.com",
        "images": [
            "https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2022/5/17/1655440475287/146-ASN100.jpg",
            "https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2022/5/17/1655440482209/146-ASN100.jpg"
        ]
    },
    {
        "id": 8,
        "slug": "dca-ass150",
        "title": "DCA ASS150",
        "subtitle": "Stone Polisher",
        "description": "ASS150\\nRated Power Input: 1020W\\nNo-load Speed: 1000-3800r/min\\nMax. Wheel Dia.: Φ150mm\\nNet Weight: 2.7kg\\n\\nFeatures:\\n1. Adjustable speed;\\n2. Electronic constant speed control;\\n3. Water flow control.\\n\\nAccessories & Package: Auxiliary Handle, Wrench, Carbon Brush, Color Box Packing",
        "source": "dcatools.com",
        "images": [
            "https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2023/8/18/1694999360511/150-ASS150.jpg",
            "https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2023/8/18/1694999369103/150-ASS150.jpg"
        ]
    },
    {
        "id": 9,
        "slug": "dca-asm18-115",
        "title": "DCA ASM18-115",
        "subtitle": "Angle Grinder",
        "description": "ASM18-115\\nRated Power Input: 860W\\nRated Speed: 11800/min\\nMax. Wheel Dia.: Φ115mm\\nNet Weight: 1.6kg\\n\\nFeatures:\\n1. Ultra-slim body for comfortable hold;\\n2. Powerful 860W motor;\\n3. Compact gear housing.\\n\\nAccessories & Package: Auxiliary Handle, Wrench, Carbon Brush, Color Box Packing",
        "source": "dcatools.com",
        "images": [
            "https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2024/11/6/1733465849979/ASM18-100%26115%E6%9C%89%E8%BE%85%E5%8A%A9%E6%89%8B%E6%9F%84.png",
            "https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2024/11/6/1733465857430/ASM18-100%26115%E6%9C%89%E8%BE%85%E5%8A%A9%E6%89%8B%E6%9F%84.png"
        ]
    },
    {
        "id": 10,
        "slug": "dca-asm04-125",
        "title": "DCA ASM04-125",
        "subtitle": "Angle Grinder",
        "description": "ASM04-125\\nRated Power Input: 1020W\\nRated Speed: 4200-11800/min\\nMax. Wheel Dia.: Φ125mm\\nNet Weight: 2.1kg\\n\\nFeatures:\\n1. 1020W high power, Adjustable speed;\\n2. Constant output power;\\n3. Spindle lock, Slide switch.\\n\\nAccessories & Package: Auxiliary Handle, Wrench, Carbon Brush, Color Box Packing",
        "source": "dcatools.com",
        "images": [
            "https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2024/10/29/1732861041994/ASM04-125.png",
            "https://dongcheng.obs.ap-southeast-1.myhuaweicloud.com/cms/2024/10/29/1732861062473/ASM04-125.png"
        ]
    }
]

def get_ext(url):
    parts = url.split('?')[0].split('.')
    ext = parts[-1].lower().split('%')[0]
    return ext if ext in ['jpg', 'jpeg', 'png', 'webp', 'gif'] else 'jpg'

# Download all images
print(f"Saving files to: {DEST}")
print(f"Total products: {len(PRODUCTS)}")
print(f"Total images: {sum(len(p['images']) for p in PRODUCTS)}")
print()

for product in PRODUCTS:
    print(f"Product {product['id']}: {product['title']}")
    for i, url in enumerate(product['images'], 1):
        ext = get_ext(url)
        filename = f"{product['slug']}_{i:02d}.{ext}"
        filepath = DEST / filename
        try:
            r = requests.get(url, headers=HEADERS, timeout=30, stream=True)
            r.raise_for_status()
            with open(filepath, 'wb') as f:
                for chunk in r.iter_content(8192):
                    f.write(chunk)
            size = os.path.getsize(filepath)
            print(f"  ✓ {filename} ({size:,} bytes)")
        except Exception as e:
            print(f"  ✗ {filename}: {e}")

# Save product data JSON
json_path = DEST / "product_data.json"
data_for_json = []
for p in PRODUCTS:
    data_for_json.append({
        'id': p['id'], 'slug': p['slug'], 'title': p['title'],
        'subtitle': p.get('subtitle', ''), 'description': p.get('description', ''),
        'source': p['source'],
        'images': [{'url': url, 'filename': f"{p['slug']}_{i+1:02d}.{get_ext(url)}"} for i, url in enumerate(p['images'])]
    })
with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(data_for_json, f, indent=2, ensure_ascii=False)
print(f"\n✓ Saved: {json_path}")

# Save text catalog
txt_path = DEST / "product_catalog.txt"
with open(txt_path, 'w', encoding='utf-8') as f:
    f.write("PRODUCT CATALOG\n")
    f.write("=" * 60 + "\n")
    f.write(f"Generated: 2026-02-26T19:24:12.940Z\n")
    f.write(f"Total Products: {len(PRODUCTS)}\n\n")
    for p in PRODUCTS:
        f.write("=" * 60 + "\n")
        f.write(f"ID: {p['id']}\n")
        f.write(f"Title: {p['title']}\n")
        if p.get('subtitle'):
            f.write(f"Subtitle: {p['subtitle']}\n")
        f.write(f"Source: {p['source']}\n")
        f.write(f"\nDescription:\n{p.get('description', 'N/A')}\n")
        f.write(f"\nImages ({len(p['images'])}):\n")
        for i, url in enumerate(p['images'], 1):
            ext = get_ext(url)
            fn = f"{p['slug']}_{i:02d}.{ext}"
            f.write(f"  {i}. {fn}\n     {url}\n")
        f.write("\n")
print(f"✓ Saved: {txt_path}")
print("\n=== COMPLETE ===")
