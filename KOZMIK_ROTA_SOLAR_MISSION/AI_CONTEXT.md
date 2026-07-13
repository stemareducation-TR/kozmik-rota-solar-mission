# AI_CONTEXT.md

## Görev
KOZMİK ROTA: SOLAR MISSION adlı 2D mobil uyumlu web oyununun analiz, tasarım ve geliştirme çalışmalarında bu klasördeki dokümanları kaynak olarak kullan.

## Öncelik sırası
1. `docs/KOZMIK_ROTA_SOLAR_MISSION_PROJECT_DOCUMENT.md`
2. `config/game_design.json`
3. `assets/` altındaki görsel referanslar
4. Kullanıcının daha sonra vereceği yeni kararlar

## Değiştirilemez temel kararlar
- Dünya başlangıç üssüdür.
- Ana oynanabilir bölümler: Merkür, Venüs, Mars, Jüpiter, Satürn, Uranüs, Neptün.
- Bölümler ayrı oynanır ve sırayla açılır.
- Oyun yandan görünüşlüdür.
- Altay-X ekranın tamamında hareket eder.
- Araç otomatik ilerler; oyuncu kısa süreli hızlanabilir ve yavaşlayabilir.
- Yakıt ve kalkan ayrı kaynaklardır.
- Enerji simgesine fiziksel temas edildiğinde oyun durur ve soru açılır.
- Sorular oynanan gezegenle ilgilidir.
- Silah simgesi 10 lazer atışı verir.
- Bazı düşmanlar öldürülebilir, bazıları yalnızca kaçılarak geçilir.
- Ortak düşmanlara ek olarak her gezegende özel düşman ve boss vardır.
- Her bölümde bir defalık acil enerji hakkı bulunur.
- İlk sürümde kullanıcı hesabı yoktur.
- Görsel stil 16-bit konsol ile modern retro piksel sanatının birleşimidir.
- Varlıklar dosyalardan yüklenir.

## İlk geliştirme hedefi
Yalnızca Merkür bölümünün tam oynanabilir MVP'sini üret.

## Varsayım yapma kuralı
Eksik kararlarda tahmin üretilebilir ancak her tahmin açıkça `ÖNERİ` veya `VARSAYIM` olarak etiketlenmelidir.
