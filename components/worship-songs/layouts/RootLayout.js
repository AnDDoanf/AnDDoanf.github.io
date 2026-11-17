import { useState } from 'react';
import Header from './Header';
import Footer from './Footer';
import UsageGuideModal from '../components/common/UsageGuideModal';

function RootLayout({ children, mode, footerProps }) {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  return (
    <div className={`worship-songs-app app-shell ${mode ? 'dark-mode' : ''}`}>
      <div className="worship-container">
        <Header onOpenGuide={() => setIsGuideOpen(true)} />
        <main>{children}</main>
        <UsageGuideModal trigger={isGuideOpen} setTrigger={setIsGuideOpen} />
      </div>
      <Footer {...footerProps} />
    </div>
  );
}

export default RootLayout;
