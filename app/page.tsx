import Link from "next/link";
import Image from "next/image";
import { 
  FiLogIn, 
  FiUserPlus, 
  FiGithub, 
  FiLink, 
  FiGlobe, 
  FiCpu, 
  FiCode, 
  FiLayers, 
  FiBox,
  FiArrowRight,
  FiTwitter,
  FiLinkedin,
  FiMail 
} from "react-icons/fi";

// Navbar component
const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white flex items-center">
          <span className="text-blue-500">Start</span>
          <span className="text-white">5</span>
        </Link>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#features" className="text-gray-300 hover:text-white transition">Özellikler</a>
          <a href="#projects" className="text-gray-300 hover:text-white transition">Projeler</a>
          <a href="#why" className="text-gray-300 hover:text-white transition">Neden Start5?</a>
          <a href="#how" className="text-gray-300 hover:text-white transition">Nasıl Çalışır?</a>
        </nav>
        
        <div className="flex gap-3">
          <Link
            href="/login"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
          >
            <FiLogIn className="mr-2" />
            Giriş Yap
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            <FiUserPlus className="mr-2" />
            Kayıt Ol
          </Link>
        </div>
      </div>
    </header>
  );
};

// Footer component
const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Link href="/" className="text-2xl font-bold text-white flex items-center mb-4">
              <span className="text-blue-500">Start</span>
              <span className="text-white">5</span>
            </Link>
            <p className="text-gray-400 mb-6">Fikirden ürüne, 5 günde.</p>
            <div className="flex space-x-4">
              <a href="https://twitter.com/start5" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiTwitter />
              </a>
              <a href="https://github.com/start5" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiGithub />
              </a>
              <a href="https://linkedin.com/company/start5" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <FiLinkedin />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Bağlantılar</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors">Hakkımızda</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Fiyatlandırma</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">İletişim</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Kaynaklar</h4>
            <ul className="space-y-2">
              <li><Link href="/docs" className="text-gray-400 hover:text-white transition-colors">Dokümanlar</Link></li>
              <li><Link href="/tutorials" className="text-gray-400 hover:text-white transition-colors">Eğitimler</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">SSS</Link></li>
              <li><Link href="/support" className="text-gray-400 hover:text-white transition-colors">Destek</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Yasal</h4>
            <ul className="space-y-2">
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Kullanım Koşulları</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Gizlilik Politikası</Link></li>
              <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Çerez Politikası</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Start5. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-500">
              Fikrini kodla, 5 günde yayına al!
            </h1>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
              Start5 ile projelerinizi hızla geliştirin, showcase'leyin ve teknik becerileri paylaşın. MVP'nizi hızlıca oluşturup hemen yayına alın.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiLogIn className="mr-2" />
                Giriş Yap
              </Link>
              <Link
                href="/projects/new"
                className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <FiBox className="mr-2" />
                Projeni Ekle
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Özellikler & Avantajlar</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500 transition-colors group">
              <div className="bg-blue-600/20 rounded-full w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-blue-600/30 transition-colors">
                <FiCpu className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Hızlı MVP</h3>
              <p className="text-gray-400">Minimum Viable Product'ınızı hızlıca oluşturun ve 5 gün içerisinde yayına alın.</p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500 transition-colors group">
              <div className="bg-blue-600/20 rounded-full w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-blue-600/30 transition-colors">
                <FiGlobe className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Demo Yayını</h3>
              <p className="text-gray-400">Projelerinizi anında demo olarak yayınlayın ve kullanıcı geri bildirimi alın.</p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500 transition-colors group">
              <div className="bg-blue-600/20 rounded-full w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-blue-600/30 transition-colors">
                <FiGithub className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">GitHub Entegrasyonu</h3>
              <p className="text-gray-400">Otomatik GitHub entegrasyonu ile projelerinizi ve kodunuzu kolayca yönetin.</p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-blue-500 transition-colors group">
              <div className="bg-blue-600/20 rounded-full w-14 h-14 flex items-center justify-center mb-6 group-hover:bg-blue-600/30 transition-colors">
                <FiLayers className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Kişisel Vitrin</h3>
              <p className="text-gray-400">Projeleriniz için profesyonel bir portföy oluşturun ve teknik becerilerinizi sergileyin.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Projects Section */}
      <section id="projects" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">Örnek Projeler</h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">Platformda geliştiriciler tarafından paylaşılan açık kaynak projeler</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Project Card 1 */}
            <div className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-900/20 transition">
              <div className="aspect-video relative bg-gray-700">
                {/* This would be actual project image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <FiCode className="w-12 h-12" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">E-Ticaret Dashboard</h3>
                <p className="text-gray-400 text-sm mb-3">Next.js ve Tailwind ile geliştirilmiş modern e-ticaret yönetim paneli.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">React</span>
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">Tailwind</span>
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">Next.js</span>
                </div>
                <Link href="/projects/1" className="text-blue-400 text-sm flex items-center hover:text-blue-300">
                  Detayları Gör
                  <FiArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
            
            {/* Project Card 2 */}
            <div className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-900/20 transition">
              <div className="aspect-video relative bg-gray-700">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <FiCode className="w-12 h-12" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">AI Not Defteri</h3>
                <p className="text-gray-400 text-sm mb-3">Yapay zeka destekli akıllı not tutma uygulaması. Özetleme ve sınıflandırma özelliği.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">Vue.js</span>
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">Node.js</span>
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">OpenAI</span>
                </div>
                <Link href="/projects/2" className="text-blue-400 text-sm flex items-center hover:text-blue-300">
                  Detayları Gör
                  <FiArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
            
            {/* Project Card 3 */}
            <div className="bg-gray-800 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-blue-900/20 transition">
              <div className="aspect-video relative bg-gray-700">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  <FiCode className="w-12 h-12" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">Fitness Takip App</h3>
                <p className="text-gray-400 text-sm mb-3">Egzersiz ve beslenme takibi yapabileceğiniz mobil uyumlu web uygulaması.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">React Native</span>
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">Expo</span>
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded-full">Firebase</span>
                </div>
                <Link href="/projects/3" className="text-blue-400 text-sm flex items-center hover:text-blue-300">
                  Detayları Gör
                  <FiArrowRight className="ml-1" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/explore" className="inline-flex items-center px-5 py-3 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
              Tüm Projeleri Keşfet
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Why Start5 Section */}
      <section id="why" className="py-20 bg-gray-950">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Neden Start5?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="bg-blue-600/20 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <FiCpu className="text-blue-400" />
                  </span>
                  Hızlı Geliştirme Süreci
                </h3>
                <p className="text-gray-400 pl-11">5 günlük süreçte fikrinizi çalışan bir prototipe dönüştürün.</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="bg-blue-600/20 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <FiGlobe className="text-blue-400" />
                  </span>
                  Anında Yayın İmkanı
                </h3>
                <p className="text-gray-400 pl-11">Projelerinizi anında tanıtın ve dünyaya gösterin.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center">
                  <span className="bg-blue-600/20 rounded-full w-8 h-8 flex items-center justify-center mr-3">
                    <FiLink className="text-blue-400" />
                  </span>
                  Birbirine Bağlı Ekosistem
                </h3>
                <p className="text-gray-400 pl-11">Diğer geliştiricilerle bağlantı kurun ve projeleri keşfedin.</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl p-8">
              <blockquote className="text-white">
                <p className="text-lg font-medium mb-6">"Start5 ekibinin desteği ile projemi sadece 3 günde tamamladım ve kullanıcılara sundum. Aldığım geri bildirimlerle projemin eksiklerini görerek hızla iyileştirdim."</p>
                <footer className="font-semibold">- Ahmet Y., Start5 Kullanıcısı</footer>
              </blockquote>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section id="how" className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">Nasıl Çalışır?</h2>
          
          <div className="flex flex-col md:flex-row justify-between max-w-4xl mx-auto">
            <div className="text-center mb-10 md:mb-0 relative">
              <div className="bg-blue-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 relative z-10">
                <span className="text-xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Giriş Yap</h3>
              <p className="text-gray-400 max-w-xs mx-auto">Hesabınızla giriş yapın veya yeni bir hesap oluşturun.</p>
              
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
            </div>
            
            <div className="text-center mb-10 md:mb-0 relative">
              <div className="bg-blue-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 relative z-10">
                <span className="text-xl font-bold text-blue-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Projeni Ekle</h3>
              <p className="text-gray-400 max-w-xs mx-auto">Projenizin detaylarını ve görselleri ekleyin, GitHub'a bağlayın.</p>
              
              {/* Connector line */}
              <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-blue-500 to-transparent"></div>
            </div>
            
            <div className="text-center">
              <div className="bg-blue-600/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-blue-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Yayına Al</h3>
              <p className="text-gray-400 max-w-xs mx-auto">Projenizi public veya private olarak yayına alın ve paylaşın.</p>
            </div>
          </div>
          
          <div className="text-center mt-16">
            <Link href="/register" className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Hemen Başla
              <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
