import { useNavigate } from 'react-router-dom';
import styles from './Game.module.css';

const sections = [
    {
        key: 'locations',
        icon: 'add_location_alt',
        label: 'Locations',
        description: 'Add and manage explorable game locations with tasks and coordinates.',
        accent: '#10b981',
        bg: '#dcfce7',
        border: '#bbf7d0',
    },
    /*  {
         key: 'budget-settings',
         icon: 'monetization_on',
         label: 'Budget Settings',
         description: 'Configure cost thresholds that determine budget tiers for locations.',
         accent: '#d97706',
         bg: '#fef3c7',
         border: '#fde68a',
     }, */
    {
        key: 'quests',
        icon: 'map',
        label: 'Quests',
        description: 'Create multi-location quests with XP rewards, badges, and titles.',
        accent: '#7c3aed',
        bg: '#ede9fe',
        border: '#ddd6fe',
    },
    {
        key: 'reports',
        icon: 'flag',
        label: 'Reports',
        description: 'Review and remove community photos flagged by users.',
        accent: '#dc2626',
        bg: '#fee2e2',
        border: '#fecaca',
    },
];

const Game = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <div>
                    <h1 className={styles.title}>Game Dashboard</h1>
                    <p className={styles.subtitle}>Manage all aspects of your game from one place.</p>
                </div>
            </div>

            <div className={styles.grid}>
                {sections.map((section, i) => (
                    <button
                        key={section.key}
                        className={styles.card}
                        onClick={() => navigate(section.key)}
                        style={{ '--card-accent': section.accent, '--card-bg': section.bg, '--card-border': section.border, animationDelay: `${i * 80}ms` }}
                    >
                        <div className={styles.iconWrap}>
                            <span className="material-symbols-outlined">{section.icon}</span>
                        </div>
                        <div className={styles.cardBody}>
                            <h2 className={styles.cardTitle}>{section.label}</h2>
                            <p className={styles.cardDesc}>{section.description}</p>
                        </div>
                        <div className={styles.cardArrow}>
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Game;