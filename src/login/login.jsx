import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../apiClient"; // apiClient 임포트
import "../App.css";
import "./login.css";
import "./input.css";
import styles from "./background.module.css";
import Modal from "react-modal";
Modal.setAppElement("#root");

function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emailSpan, setEmailSpan] = useState(""); // 이메일 오류 메시지
  const [passwordSpan, setPasswordSpan] = useState(""); // 비밀번호 오류 메시지

  const onLogin = async (e) => {
    e.preventDefault();

    // 입력값 검증
    if (!email) {
      setEmailSpan("이메일을 입력해 주십시오.");
    }

    if (!password) {
      setPasswordSpan("비밀번호를 입력해 주십시오.");
    }

    if (!email || !password) {
      return; // 이메일 또는 비밀번호 입력이 없으면 리턴
    }
    const loginDTO = {
      email: email,
      password: password,
    };
    const baseURL = "https://sangsang2.kr:8080/api/member/login";
    console.log(loginDTO);
    if (!email || !password) {
      return;
    }

    try {
      const data = await apiClient(baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: loginDTO,
      });

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      setIsModalOpen(true);
    } catch (error) {
      if (error.message.includes("비밀번호가 일치하지 않음")) {
        setPasswordSpan("비밀번호가 일치하지 않습니다. 다시 확인해주세요.");
      } else if (error.message.includes("사용자 찾을 수 없음")) {
        setEmailSpan("사용자를 찾을 수 없습니다");
      } else {
        alert("로그인에 실패했습니다.");
      }
      console.error("Error occurred during login:", error);
    }
  };

  const handleConfirm = () => {
    setIsModalOpen(false); // 모달 닫기
    navigate("/home"); // 홈으로 이동
  };

  return (
    <div id="mobile-view" className={styles.background}>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="로그인 성공"
        className="modal"
        overlayClassName="overlay"
      >
        <h2>로그인 성공</h2>
        <div className="modal-buttons">
          <button onClick={handleConfirm} className="confirm-btn">
            확인
          </button>
        </div>
      </Modal>
      <div id="login-container">
        <form onSubmit={onLogin} id="login_Box">
          <img src="/logo.png" id="logo" />

          <div className="input_divider">
            <h1 id="greetingTxt">
              모먼트 클래스에
              <br /> 오신걸 환영합니다.
            </h1>
            <div className="login-inputBox">
              <span className="inputBox_txt">이메일</span>
              <input
                type="email"
                className={`inputBox_input ${emailSpan ? "error-border" : ""}`}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailSpan(""); // 입력이 수정되면 오류 메시지 제거
                }}
              />
              <span className="alertSpan">{emailSpan}</span>
            </div>
            <div className="login-inputBox">
              <span className="inputBox_txt">비밀번호</span>
              <input
                type="password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordSpan(""); // 입력이 수정되면 오류 메시지 제거
                }}
                className={`inputBox_input ${
                  passwordSpan ? "error-border" : ""
                }`}
              />
              <span className="alertSpan">{passwordSpan}</span>
            </div>
          </div>
          <div className="input_divider">
            <button type="submit" className="submitBTN">
              <span>로그인</span>
            </button>
            <footer id="login-footer">
              <span id="login-footerTxt">아직 계정이 없으신가요?</span>
              <Link to="/signup1" id="login-footerLink">
                회원가입
              </Link>
            </footer>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
