import { React } from 'react';
import { NavLink } from "react-router-dom";
import "./css/navbar.css";

const Navbar = () => {
    const navItem = [
        { text: '검색', className: 'search', icon: 'search_icon.svg', activeIcon: 'search_active_icon.svg' },
        { text: '내 주변', className: 'map', icon: 'map_icon.svg', activeIcon: 'map_active_icon.svg' },
        { text: '홈', className: 'home', icon: 'home_icon.svg', activeIcon: 'home_active_icon.svg' },
        { text: '채팅', className: 'chats', icon: 'chat_icon.svg', activeIcon: 'chat_active_icon.svg' },
        { text: '프로필', className: 'profile', icon: 'profile_icon.svg', activeIcon: 'profile_active_icon.svg' },
    ];

    return (
        <div id="navBar" className='navBar'>
            {navItem.map((item, i) => {
                return (
                    <NavLink
                        key={i}
                        to={`/${item.className}`}
                        className={({ isActive }) => 
                            `${item.className}Link navLink ${isActive ? 'active' : ''}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                              <div className='navImgBox'>
                                <img 
                                    src={require(`./img/${isActive ? item.activeIcon : item.icon}`)} 
                                    alt={`${item.text}img`} 
                                    className="navbarImg" 
                                />
                              </div>
                              <p 
                                className={`${item.className}Txt`}
                                style={isActive 
                                    ? { color: '#171217', fontWeight: 'bold' } 
                                    : { color: '#8C5E8A', fontWeight: 'normal' }
                                }
                              >
                                {item.text}
                              </p>
                            </>
                        )}
                    </NavLink>
                );
            })}
        </div>
    );
};

export default Navbar;
