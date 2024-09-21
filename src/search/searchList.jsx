import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import "../App.css";
import "./css/search_main.css";
import "./css/searchList.css";

import Navbar from "../main/navbar";

function SearchList() {
  const location = useLocation();
  const navigate = useNavigate();
  const defaultImageUrl = "/defaultclass.png";
  const [searchInput, setSearchInput] = useState("");
  const [courses, setCourses] = useState(location.state?.formattedData || []);
  const handleSearch = async (e) => {
    e.preventDefault();
    const baseUrl = `https://sangsang2.kr:8080/api/lecture/search?keyword=${searchInput}`;

    try {
      const response = await fetch(baseUrl, {
        method: "GET",
      });
      const data = await response.json();

      if (!response.ok) {
        alert("클래스 검색에 실패했습니다.");

        return;
      }
      const formattedData = data.map((course) => ({
        id: course.id,
        name: course.name,
        type: course.type,
        price: course.price,
        searchCount: course.searchCount, //검색 횟수
        averageScore: course.averageScore, //리뷰 평점
        scoreCount: course.scoreCount, //리뷰 수

        imageUrls:
          Array.isArray(course.imageUrl) && course.imageUrl.length > 0
            ? course.imageUrl[0].imageUrl
            : defaultImageUrl,

        //이미지가 있으면 한개만 추출,없으면 디폴트이미지
      }));

      setCourses(formattedData);
      console.log(formattedData);
    } catch (error) {
      console.error("Error occurred during delete:", error);
      alert("Error occurred " + error.message);
    }
  };

  

  return (
    <div id="mobile-view">
      <header className="app-header reviewHeader defaultHeader">
        <Link to="/search">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h3>검색 결과</h3>
      </header>
      <main id="default-padding" className="searchListMain">
        <form
          className="second_search-form search-form"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            className="search-input"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit" className="search-button">
            <span className="material-symbols-outlined">search</span>
          </button>
        </form>
        <section className="searchList-main">
          <div id="searchList-selectBox">
            <select name="order">
              <option name="order" value="normal">
                기본 순
              </option>
              <option name="order" value="searchCount">
                최다 검색 순
              </option>
              <option name="order" value="scoreCount">
                리뷰 많은 순
              </option>
              <option name="order" value="averageScore">
                별점 높은 순
              </option>
            </select>
          </div>
          <section className="mySearchList-main">
            {/* 마이클래스 ui 가져옴*/}
            {courses.map((course) => (
              <div
                key={course.id}
                className="search-contentBox"
                onClick={() => {
                  navigate(`/home/class_application/${course.id}`);
                }}
              >
                <img
                  src={course.imageUrls || defaultImageUrl}
                  alt={course.name}
                  className="search-contentBox_img"
                />
                <h4>{course.name}</h4>
                <div>
                  <p>${course.price.toLocaleString()}</p>
                  <p>{course.type}</p>
                </div>
              </div>
            ))}
          </section>
        </section>
      </main>
      <Navbar></Navbar>
    </div>
  );
}

export default SearchList;
