# KOZMİK ROTA: SOLAR MISSION
## Oyun Tasarım ve Proje Dokümanı
**Sürüm:** 0.1  
**Durum:** Ön analiz / geliştirme öncesi kaynak doküman  
**Platform hedefi:** Web, mobil tarayıcı ve daha sonra Google Play  
**Ana teknoloji önerisi:** Phaser + JavaScript/TypeScript + Capacitor  
**Görsel yön:** 1990'lar 16-bit konsol estetiği ile modern retro piksel sanatının birleşimi

---

## 1. Projenin amacı

Altay-X markasını ve YouTube kanalındaki bilim içeriklerini oyunlaştıran, mobilde oynanabilen, yandan görünüşlü bir uzay macera oyunu geliştirilecektir.

Oyuncu Altay-X aracını kontrol ederek Dünya'dan yola çıkacak ve Güneş Sistemi'ndeki gezegenlere ayrı görevler hâlinde ulaşacaktır. Oynanış; kaçınma, sınırlı ateş etme, yakıt yönetimi, enerji toplama ve gezegenle ilgili bilim sorularını cevaplama sistemlerini birleştirecektir.

Proje önce web oyunu olarak yayımlanacak, daha sonra aynı kod tabanı Android uygulamasına dönüştürülerek Google Play'e hazırlanacaktır.

---

## 2. Temel oyun kimliği

**Tür:** 2D yandan görünüşlü arcade uzay oyunu  
**Kamera:** Yandan görünüm  
**Ekran yönü:** Yatay 16:9  
**Kontrol:** Mobilde sürükleme; masaüstünde fare ve isteğe bağlı klavye  
**Hedef kitle:** Genel izleyici  
**Oturum yapısı:** Her gezegen ayrı bölüm  
**İlerleme:** Bir bölüm tamamlanınca sonraki gezegen açılır  
**Kullanıcı hesabı:** İlk sürümde yok  
**Kayıt:** Tarayıcı LocalStorage / cihaz içi kayıt

---

## 3. Hikâye ve rota

Altay-X Dünya'daki başlangıç üssünden hareket eder.

Dünya oynanabilir ana bölüm değil, başlangıç merkezi ve eğitim alanıdır. Ana görev sırası:

1. Merkür
2. Venüs
3. Mars
4. Jüpiter
5. Satürn
6. Uranüs
7. Neptün

Toplam **7 ana bölüm** vardır.

Gezegenler oynanış fiziğini değiştirmez. Her gezegen:
- bölüm hedefini,
- arka planı,
- görsel atmosferi,
- özel düşmanı,
- bölüm sonu bossunu,
- bilim sorularını

belirler.

---

## 4. Ana oyun döngüsü

1. Bölüm seçilir.
2. Altay-X Dünya'dan görev rotasına çıkar.
3. Araç otomatik olarak ilerler.
4. Oyuncu aracı ekranın tamamında yukarı, aşağı, ileri ve geri hareket ettirir.
5. Oyuncu kısa süreli hızlanabilir veya yavaşlayabilir.
6. Canavarlardan ve engellerden kaçılır.
7. Silah simgesi alınırsa 10 lazer atışı kazanılır.
8. Enerji simgesi alınırsa oyun durur ve soru açılır.
9. Doğru cevap yakıt kazandırır.
10. Yanlış cevap yakıt azaltır.
11. Bölüm sonunda boss ile karşılaşılır.
12. Boss geçilirse gezegene ulaşılır ve sonraki bölüm açılır.

---

## 5. Kontrol sistemi

### Mobil
- Altay-X parmakla sürüklenir.
- Araç ekranın tamamında hareket edebilir.
- Ekranın sağ alt tarafında ateş düğmesi bulunur.
- Hızlanma ve yavaşlama için ayrı butonlar veya sürükleme davranışı kullanılabilir.
- Oyuncunun parmağı aracın üzerine gelmek zorunda değildir; göreli sürükleme tercih edilmelidir.

### Masaüstü
- Fareyle sürükleme
- İsteğe bağlı WASD veya yön tuşları
- Ateş için boşluk tuşu

### Ekran
Yandan görünüş ve boss savaşları nedeniyle varsayılan yön **yatay 16:9** olacaktır. Telefon dik tutulduğunda cihazı yatay çevirme uyarısı gösterilecektir.

---

## 6. Kaynak sistemleri

### 6.1 Yakıt
Yakıt bölüm boyunca sürekli azalır.

Yakıtı etkileyen olaylar:
- Doğru cevap: yakıt artar
- Yanlış cevap: yakıt azalır
- Cevap süresinin dolması: yakıt azalır
- Bazı özel saldırılar: yakıt azaltabilir
- Acil enerji sistemi: bir kez yakıt geri kazandırır

Yakıt sıfıra düşerse motor kapanır ve görev başarısız olur.

### 6.2 Enerji kalkanı
Kalkan, çarpışma ve düşman saldırılarına karşı koruma sağlar.

- Asteroit çarpışması: kalkan azaltır
- Canavar teması: kalkan azaltır
- Boss saldırısı: kalkan azaltır
- Kalkan sıfırlandıktan sonraki ağır hasar aracı devre dışı bırakabilir

Yakıt ve kalkan birbirinden bağımsızdır.

### 6.3 Lazer cephanesi
- Oyuncu bölüme 0 atışla başlayabilir.
- Silah simgesi alındığında +10 atış kazanır.
- Önerilen üst sınır: 30 atış.
- Bazı düşmanlar vurulabilir.
- Bazı düşmanlar yok edilemez ve yalnızca kaçılarak geçilir.

---

## 7. Toplanabilir simgeler

### 7.1 Enerji simgesi
- Oyun alanında belirir.
- Altay-X simgeye fiziksel olarak temas etmelidir.
- Belirli süre içinde alınmazsa kaybolur.
- Alındığında oyun tamamen durur.
- Bölümle ilgili soru açılır.

### 7.2 Silah simgesi
- Oyun alanında belirir.
- Altay-X temas ederse 10 lazer atışı verir.
- Belirli süre içinde alınmazsa kaybolur.
- Alınmadan önce kısa bir retro ses efekti kullanılabilir.

---

## 8. Soru sistemi

Sorular oynanan gezegenle ilgili olacaktır.

### Soru karşılaşması
- Enerji simgesi alındığında oyun tamamen durur.
- Arka plan hafif kararır.
- Soru ve seçenekler görünür.
- Genel izleyiciye uygun açık ve anlaşılır dil kullanılır.
- Cevap seçeneklerinin sırası her oynayışta karıştırılır.
- Doğru cevap sonrasında kısa bilgi gösterilebilir.
- Yanlış cevap sonrasında doğru cevap açıklanabilir.

### Varyasyon sistemi
Her soru karşılaşması için üç farklı soru varyasyonu hazırlanacaktır.

Merkür örneği:
- Bölümde 3 soru karşılaşması vardır.
- Her karşılaşma için 3 alternatif soru bulunur.
- Toplam 9 soruluk Merkür havuzu oluşur.
- Oyuncu her oynayışta bunların 3 tanesini görür.

Bu yapı her gezegen için ayrı uygulanacaktır.

### İlk denge önerisi
- Doğru cevap: +20 yakıt
- Yanlış cevap: -10 yakıt
- Süre dolması: -8 yakıt
- Cevap süresi: 10-12 saniye

Bu değerler prototip testinden sonra değiştirilecektir.

---

## 9. Düşman sistemi

### Ortak düşmanlar
Bütün bölümlerde kullanılabilecek ortak düşmanlar:
- küçük uzay yaratığı,
- takip eden mekanik düşman,
- asteroid,
- enerji bulutu veya uzay mayını.

### Bölüme özel düşman
Her gezegende bir özel düşman bulunacaktır.

### Düşman sınıfları
1. **Yok edilebilir:** Lazerle vurulabilir.
2. **Yok edilemez:** Yalnızca kaçılarak geçilir.

Oyuncu düşmanın türünü görsel tasarımdan anlayabilmelidir.

---

## 10. Boss sistemi

Her gezegenin sonunda bir boss olacaktır.

Boss:
- bölümün görsel temasına uygun olmalı,
- kendine özgü saldırı düzenine sahip olmalı,
- doğrudan sürekli ateş edilerek kolayca geçilmemeli,
- saldırı sonrası zayıf an bırakmalı,
- silah simgeleriyle yeterli cephane sağlanmalıdır.

Boss karşılaşması ana yolculuk süresine eklenir.

---

## 11. Bölüm süreleri

Merkür ana yolculuk süresi **2 dakika** olacaktır.

Gerçek astronomik mesafeler birebir kullanılmayacaktır. Bunun yerine uzaklık algısını koruyan, oynanabilirliği bozmayan sıkıştırılmış süreler kullanılacaktır.

İlk öneri:

| Bölüm | Gezegen | Yolculuk süresi | Boss hedef süresi | Tahmini toplam |
|---|---|---:|---:|---:|
| 1 | Merkür | 2:00 | 0:45-1:00 | 2:45-3:00 |
| 2 | Venüs | 2:30 | 0:50-1:05 | 3:20-3:35 |
| 3 | Mars | 3:10 | 0:55-1:10 | 4:05-4:20 |
| 4 | Jüpiter | 4:30 | 1:00-1:20 | 5:30-5:50 |
| 5 | Satürn | 5:30 | 1:10-1:30 | 6:40-7:00 |
| 6 | Uranüs | 6:45 | 1:15-1:40 | 8:00-8:25 |
| 7 | Neptün | 8:00 | 1:30-2:00 | 9:30-10:00 |

Bu süreler kesin değildir; oynanış testleriyle ayarlanacaktır.

---

## 12. Acil enerji sistemi

Her bölümde bir kez kullanılabilir.

İlk ölüm veya tükenme durumunda:
- yakıt %25'e,
- kalkan %30'a

geri getirilir ve oyun devam eder.

Aynı bölümde ikinci kez başarısız olunursa bölüm baştan başlar.

Acil enerji hakkı her yeni bölümde yenilenir.

---

## 13. Görsel sanat yönü

Hedef stil:
- 1990'lar 16-bit konsol kalitesi,
- modern retro piksel sanatının okunabilirliği,
- net siluetler,
- bulanık olmayan piksel ölçekleme,
- katmanlı yıldız arka planları,
- sınırlı fakat güçlü parçacık efektleri,
- retro arayüz panelleri,
- modern mobil okunabilirlik.

Altay-X referans görseli:
`assets/player/Altay_X_16_bit_multi_view.png`

Bu görsel güncel ana tasarım referansıdır ve çoklu açı (sol, sağ, ön, arka) içerir. Sprite üretimi ve yön tabanlı animasyonlar bu referanstan çıkarılacaktır. Oyun için ayrıca animasyon kareleri üretilecektir:
- normal uçuş,
- hızlanma,
- yavaşlama,
- yukarı eğim,
- aşağı eğim,
- hasar,
- kalkan,
- motor alevi,
- imha veya motor kapanması.

---

## 14. Ses tasarımı

Ses dünyası 1990'ların oyunlarını çağrıştıracaktır.

Gerekli sesler:
- ana menü müziği,
- bölüm müziği,
- boss müziği,
- lazer,
- simge toplama,
- enerji simgesi uyarısı,
- doğru cevap,
- yanlış cevap,
- kalkan hasarı,
- yakıt uyarısı,
- motor kapanması,
- bölüm tamamlama,
- yeni gezegen açılması.

Sesler telifsiz, özgün veya lisanslı olmalıdır.

---

## 15. Arayüz

Oyun ekranında:
- Yakıt göstergesi
- Kalkan göstergesi
- Lazer atış sayısı
- Bölüm / gezegen adı
- İlerleme çubuğu veya kalan mesafe
- Duraklatma düğmesi
- Ateş düğmesi

Soru ekranında:
- Soru metni
- 3 cevap seçeneği
- Geri sayım
- Yakıt ödülü/cezası göstergesi

---

## 16. Kayıt sistemi

İlk sürümde kullanıcı hesabı olmayacaktır.

Kaydedilecek bilgiler:
- açılan bölümler,
- tamamlanan gezegenler,
- bölüm bazlı en yüksek skor,
- doğru cevap oranı,
- en yüksek kalan yakıt,
- ses ayarları,
- eğitim ekranının görülüp görülmediği.

Web sürümünde LocalStorage kullanılacaktır.

---

## 17. Teknik yayın planı

### Aşama 1 — Web prototipi
- GitHub repository
- Phaser tabanlı oyun
- GitHub Pages veya kendi web sitesi
- Mobil tarayıcı testi

### Aşama 2 — Web yayını
- Kendi alan adı
- YouTube açıklamasından bağlantı
- Mobil performans optimizasyonu
- PWA desteği

### Aşama 3 — Android
- Capacitor ile paketleme
- Android Studio
- AAB üretimi
- Google Play test ve yayın süreci

Tek kod tabanı korunacaktır.

---

## 18. MVP kapsamı

İlk oynanabilir sürüm:
- Yatay 16:9 ekran
- Altay-X hareketi
- Yakıt ve kalkan
- 1 ortak düşman
- 1 yok edilemez engel
- Enerji simgesi
- Soru sistemi
- Silah simgesi
- 10 atış
- Merkür bölümü
- Merkür bossu
- Acil enerji sistemi
- LocalStorage kayıt

İlk test Merkür bölümü tamamlandıktan sonra diğer gezegenlere geçilecektir.

---

## 19. Varlık klasörleri

```text
assets/
├── player/
├── planets/
├── enemies/
│   ├── common/
│   └── special/
├── bosses/
├── pickups/
├── backgrounds/
├── ui/
├── effects/
└── audio/
    ├── music/
    └── sfx/
```

---

## 20. Açık kararlar

Aşağıdaki maddeler henüz kesinleştirilmemiştir:

1. Hızlanma/yavaşlama kontrolünün butonla mı sürükleme yönüyle mi yapılacağı
2. Her gezegendeki kesin soru karşılaşması sayısı
3. Yakıt azalma hızı
4. Kalkan hasar değerleri
5. Bossların isimleri ve tasarımları
6. Neptün bölümünün nihai süresi
7. Puanlama sistemi
8. Oyunun kesin adı
9. İlk sürümde Türkçe dışında dil olup olmayacağı
10. Bölüm başlamadan gezegen bilgi kartı gösterilip gösterilmeyeceği

---

## 21. Yapay zekâ için çalışma kuralları

Bu proje üzerinde çalışan yapay zekâ:

1. Bu dokümanı ana kaynak kabul etmelidir.
2. Kesinleşmiş kararları kullanıcı onayı olmadan değiştirmemelidir.
3. Açık kararları varsayım olarak işaretlemelidir.
4. İlk geliştirme hedefini Merkür MVP'si olarak korumalıdır.
5. Yeni özellik önermeden önce mevcut kapsamı ve mobil performansı değerlendirmelidir.
6. Gezegenlerin oynanış fiziğini değiştirmemelidir.
7. Soruları ilgili gezegenle sınırlı tutmalıdır.
8. Telifli oyun karakteri, ses veya görseli doğrudan kopyalamamalıdır.
9. Görselleri `assets` klasöründen çağıracak şekilde tasarlamalıdır.
10. Web ve Android için aynı kod tabanını korumalıdır.
