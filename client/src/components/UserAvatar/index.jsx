import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './style.module.css';

const UserAvatar = ({ onLogout }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const initials = user.name
        ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    return (
        <div className={styles.wrapper}>
            <div className={styles.avatar} onClick={() => navigate('/profile')}>
                {user.avatar_url
                    ? <img src={user.avatar_url} alt={user.name} />
                    : <span>{initials}</span>
                }
            </div>
            <div className={styles.dropdown}>
                <div className={styles.name}>{user.name || 'User'}</div>
                <div className={styles.email}>{user.email || ''}</div>
                <hr className={styles.divider} />
                <button onClick={() => navigate('/profile')}>Profile</button>
                <button className={styles.logout} onClick={onLogout}>Logout</button>
            </div>
        </div>
    );
};

export default UserAvatar;