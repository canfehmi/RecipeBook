namespace TarifDefterim.Infrastructure.Data;

internal static class PageContentSeed
{
    internal static readonly (Guid Id, string Slug, string Title, string ContentHtml)[] Pages =
    [
        (
            Guid.Parse("a1000001-0000-4000-8000-000000000001"),
            "hakkimizda",
            "Hakkımızda",
            """
            <p>Ata Tarifi, ailelerin nesilden nesile aktardığı tarifleri dijital ortamda güvenle saklamaları için tasarlanmış bir platformdur.</p>
            <p>Amacımız; dağınık notlar, mesajlar ve ekran görüntüleri yerine ailelere özel, düzenli ve erişilebilir bir tarif defteri sunmaktır.</p>
            <h2>Misyonumuz</h2>
            <p>Aile kültürünün önemli parçası olan yemek tariflerinin kaybolmasını önlemek ve her neslin kendi mutfak mirasını kolayca paylaşabilmesini sağlamak.</p>
            <h2>Vizyonumuz</h2>
            <p>Türkiye'de ve dünyada ailelerin güvenle kullanabileceği, sade ve kullanıcı dostu bir tarif platformu olmak.</p>
            """
        ),
        (
            Guid.Parse("a1000001-0000-4000-8000-000000000002"),
            "iletisim",
            "İletişim",
            """
            <p>Ata Tarifi ile ilgili sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçebilirsiniz.</p>
            <p><strong>E-posta:</strong> <a href="mailto:destek@atatarifi.com">destek@atatarifi.com</a></p>
            <p><strong>Çalışma saatleri:</strong> Hafta içi 09:00 – 18:00</p>
            <p>Mesajlarınıza en kısa sürede yanıt vermeye çalışıyoruz. Hesap güvenliği veya gizlilik konularında lütfen kayıtlı e-posta adresinizden yazın.</p>
            """
        ),
        (
            Guid.Parse("a1000001-0000-4000-8000-000000000003"),
            "gizlilik-politikasi",
            "Gizlilik Politikası",
            """
            <p><em>Son güncelleme: 13 Ağustos 2026</em></p>
            <p>Bu Gizlilik Politikası, Ata Tarifi platformunu kullanırken kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.</p>
            <h2>1. Toplanan Veriler</h2>
            <p>Hizmetimizi kullanırken ad, e-posta adresi, profil bilgileri, tarif içerikleri ve kullanım verileri gibi bilgiler toplanabilir.</p>
            <h2>2. Verilerin Kullanım Amaçları</h2>
            <ul>
            <li>Hesap oluşturma ve kimlik doğrulama</li>
            <li>Platform hizmetlerinin sunulması</li>
            <li>Güvenlik ve kötüye kullanımın önlenmesi</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            </ul>
            <h2>3. Veri Paylaşımı</h2>
            <p>Kişisel verileriniz, yasal zorunluluklar ve hizmet sağlayıcılarımız dışında üçüncü taraflarla paylaşılmaz. Google ile giriş yapmayı tercih ederseniz Google'ın kendi gizlilik politikası geçerli olabilir.</p>
            <h2>4. Haklarınız</h2>
            <p>KVKK kapsamında verilerinize erişme, düzeltme, silme ve işlenmesine itiraz etme haklarına sahipsiniz. Talepleriniz için bizimle iletişime geçebilirsiniz.</p>
            <h2>5. İletişim</h2>
            <p>Gizlilik ile ilgili sorularınız için <a href="mailto:destek@atatarifi.com">destek@atatarifi.com</a> adresine yazabilirsiniz.</p>
            """
        ),
        (
            Guid.Parse("a1000001-0000-4000-8000-000000000004"),
            "kullanim-sozlesmesi",
            "Kullanım / Üyelik Sözleşmesi",
            """
            <p><em>Son güncelleme: 13 Ağustos 2026</em></p>
            <p>Bu sözleşme, Ata Tarifi platformuna üye olan veya platformu kullanan tüm kullanıcılar için geçerlidir. Platformu kullanarak bu şartları kabul etmiş sayılırsınız.</p>
            <h2>1. Hizmet Tanımı</h2>
            <p>Ata Tarifi; kullanıcıların tarif oluşturmasına, aile grupları kurmasına ve tarifleri paylaşmasına olanak tanıyan bir web uygulamasıdır.</p>
            <h2>2. Üyelik ve Hesap Güvenliği</h2>
            <p>Kayıt sırasında doğru bilgi vermekle yükümlüsünüz. Hesap bilgilerinizin gizliliğinden siz sorumlusunuz. Şüpheli bir kullanım fark ederseniz derhal bize bildirin.</p>
            <h2>3. Kullanıcı İçerikleri</h2>
            <p>Yüklediğiniz tarif ve içeriklerin size ait olduğunu veya paylaşım hakkına sahip olduğunuzu beyan edersiniz. Yasalara aykırı, hakaret içeren veya telif hakkını ihlal eden içerikler yasaktır.</p>
            <h2>4. Hizmet Değişiklikleri</h2>
            <p>Platform özelliklerini geliştirmek veya yasal gereklilikler nedeniyle hizmette değişiklik yapma hakkımız saklıdır. Önemli değişiklikler kullanıcılara duyurulur.</p>
            <h2>5. Sorumluluk Sınırı</h2>
            <p>Platform "olduğu gibi" sunulur. Kesintisiz veya hatasız çalışma garantisi verilmez. Kullanıcı içeriklerinden doğan uyuşmazlıklardan platform sorumlu tutulamaz.</p>
            """
        ),
        (
            Guid.Parse("a1000001-0000-4000-8000-000000000005"),
            "kvkk",
            "KVKK Aydınlatma Metni",
            """
            <p><em>Son güncelleme: 13 Ağustos 2026</em></p>
            <p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, veri sorumlusu sıfatıyla Ata Tarifi tarafından kişisel verilerinizin işlenmesine ilişkin aydınlatma metnidir.</p>
            <h2>Veri Sorumlusu</h2>
            <p>Ata Tarifi — destek@atatarifi.com</p>
            <h2>İşlenen Kişisel Veriler</h2>
            <ul>
            <li>Kimlik ve iletişim bilgileri (ad, e-posta)</li>
            <li>Hesap ve işlem güvenliği verileri</li>
            <li>Kullanıcı tarafından oluşturulan tarif içerikleri</li>
            <li>Platform kullanım logları</li>
            </ul>
            <h2>İşleme Amaçları ve Hukuki Sebepler</h2>
            <p>Kişisel verileriniz; sözleşmenin kurulması ve ifası, meşru menfaat, açık rıza ve yasal yükümlülükler kapsamında işlenmektedir.</p>
            <h2>Aktarım</h2>
            <p>Verileriniz, hizmet altyapısı sağlayıcıları ve yasal merciler dışında üçüncü kişilere aktarılmaz. Yurt dışına aktarım söz konusu olduğunda KVKK'ya uygun önlemler alınır.</p>
            <h2>Haklarınız (KVKK md. 11)</h2>
            <p>Kişisel verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltme, silme, itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz. Başvurularınızı destek@atatarifi.com adresine iletebilirsiniz.</p>
            """
        ),
        (
            Guid.Parse("a1000001-0000-4000-8000-000000000006"),
            "cerez-politikasi",
            "Çerez Politikası",
            """
            <p><em>Son güncelleme: 13 Ağustos 2026</em></p>
            <p>Bu Çerez Politikası, Ata Tarifi web sitesinde kullanılan çerezler ve benzeri teknolojiler hakkında bilgi vermektedir.</p>
            <h2>Çerez Nedir?</h2>
            <p>Çerezler, web sitesini ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır. Oturum yönetimi, tercihlerin hatırlanması ve güvenlik amacıyla kullanılabilir.</p>
            <h2>Kullandığımız Çerez Türleri</h2>
            <ul>
            <li><strong>Zorunlu çerezler:</strong> Oturum açma ve temel site işlevleri için gereklidir.</li>
            <li><strong>İşlevsel çerezler:</strong> Tercihlerinizi hatırlamak için kullanılır.</li>
            <li><strong>Analitik çerezler:</strong> Site kullanımını anlamak için anonim istatistik toplayabilir.</li>
            </ul>
            <h2>Çerezleri Yönetme</h2>
            <p>Tarayıcı ayarlarınızdan çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezlerin devre dışı bırakılması platformun düzgün çalışmasını engelleyebilir.</p>
            <h2>Üçüncü Taraf Çerezleri</h2>
            <p>Google ile giriş gibi üçüncü taraf hizmetler kendi çerezlerini kullanabilir. Bu hizmetlerin politikaları ilgili sağlayıcıların web sitelerinde yer almaktadır.</p>
            """
        ),
    ];
}
