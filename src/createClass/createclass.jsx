import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import "../App.css";
import "../profile/profile.css";
import "./createClass.css";

function CreateClass() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const classInfo = {
    title: title,
    category: category,
    subtitle: subtitle,
    image: image,
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // 첫 번째 파일을 가져옴

    const maxSize = 10 * 1024 * 1024; // 10MB로 설정
    if (file.size > maxSize) {
      alert("이미지 파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.");
      return; // 크기가 제한을 초과하면 함수 종료
    }

    setImage(file); // 파일 객체를 상태에 저장
    setPreviewUrl(URL.createObjectURL(file)); // 미리보기 위해 URL로 변환
  };

  useEffect(() => {
    // 컴포넌트가 언마운트되거나 previewUrl이 변경될 때 URL 해제
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const goNext = (e) => {
    // 기본 동작 방지 (페이지 새로고침 막음)
    e.preventDefault();

    if (title === "" || category === "" || subtitle === "") {
      alert("클래스 제목, 카테고리, 소개글을 입력해주세요");
    } else {
      navigate("/create_class2", { state: { classInfo } });
    }
  };

  return (
    <div id="mobile-view">
      <div id="default-padding">
        <header className="app-header header_3components">
          <img
            src="/X.png"
            id="header-arrowIcon"
            onClick={() => navigate("/profile")}
          />
          <div id="chatting-title">
            <h1>클래스 개최하기</h1>
          </div>
          <span></span>
        </header>
        <form id="createClass-main">
          <div className="createInput-box">
            <input
              className="createclass-input"
              placeholder="클래스 제목"
              required
              type=" text"
              onChange={(e) => {
                setTitle(e.target.value);
              }}
            />
          </div>
          <div className="createInput-box">
            <label htmlFor="category" className="createclass-input_lable">
              카테고리
            </label>
            <select
              className="createclass-input"
              required
              id="category"
              onChange={(e) => {
                setCategory(e.target.value);
              }}
              value={category} // 선택된 값을 유지하기 위해 value 속성 추가
            >
              <option value="" disabled></option>
              <option value="COOK">요리</option>
              <option value="ART">미술</option>
              <option value="CRAFT">공예</option>
              <option value="GARDENING">원예</option>
              <option value="BEAUTY">뷰티</option>
              <option value="MUSIC">음악</option>
              <option value="EXERCISE">운동</option>
            </select>
          </div>
          <div className="createInput-box createInput-box_image">
            <input
              type="file"
              accept="image/*"
              id="create-imgFile"
              className="create-imgFile-input"
              onChange={handleImageChange}
            />
            <label htmlFor="create-imgFile" className="create-imgFile-lable">
              <img
                src={previewUrl || "/image.png"}
                id={previewUrl ? "preview" : undefined}
              />
            </label>
          </div>
          <div className="createInput-box createInput-box_image inputBox-white">
            <textarea
              type="text"
              placeholder="클레스 소개글을 입력하세요..."
              className="createclass-input_P createclass-input"
              onChange={(e) => {
                setSubtitle(e.target.value);
              }}
            />
          </div>

          <button className="nextBtn" onClick={goNext}>
            다음
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateClass;
