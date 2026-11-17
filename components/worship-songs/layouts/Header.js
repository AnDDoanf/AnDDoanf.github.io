import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiBookOpen } from 'react-icons/fi';

function Header({ onOpenGuide }) {
  const [controls, setControls] = useState(null);

  useEffect(() => {
    setControls(document.querySelector('.top-right-controls-leading'));
  }, []);

  if (!controls) return null;

  return createPortal(
      <button
        type="button"
        className="theme-icon worship-guide-button"
        onClick={onOpenGuide}
        aria-label="Mở hướng dẫn sử dụng"
        title="Cách dùng"
      >
        <FiBookOpen aria-hidden="true" />
        <span>Cách dùng</span>
      </button>,
    controls
  );
}

export default Header;
