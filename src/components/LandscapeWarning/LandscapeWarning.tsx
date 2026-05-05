import { useTranslation } from '../../context/TranslationContext';
import './LandscapeWarning.css';

export default function LandscapeWarning() {
  const { t } = useTranslation();

  return (
    <div className="landscape-warning">
      <div className="landscape-warning-content">
        {t.orientation.rotateToPortrait}
      </div>
    </div>
  );
}
