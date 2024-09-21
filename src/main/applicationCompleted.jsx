import {React, useState, useEffect } from 'react';
import { Link, useNavigate, NavLink, } from "react-router-dom";
import "./css/completed_application.css";

const CompletedApplication = () => {
    const navigate = useNavigate();

    return(
        <div id="mobile-view">
            <header className="app-header defaultHeader">
                <Link to="/home">
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                </Link>
                <h3>신청 내역</h3>
            </header>
            <main id="default-padding" className='detailApplicationMain'>
                <h3>수강 완료 페이지</h3>
            </main>
            <div className="detailApplicationBtnBox">
                <button className="payingBtn" onClick={() => navigate("/home")}>홈으로 가기</button>
            </div>
        </div>
    )
}

export default CompletedApplication;