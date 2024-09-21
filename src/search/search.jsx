import { React, useState, useEffect } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import "./css/search_main.css";
import Navbar from "../main/navbar";

const SearchPage = () => {
  const [recentSearches, setRecentSearches] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const defaultImageUrl = "/defaultclass.png"; 
  const [courses, setCourses] = useState([]); // 검색 결과 강의들
  const [classData, setClassData] = useState([]);
  const navigate = useNavigate();

  // 인기 클래스 가져오기
  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const response = await fetch("https://sangsang2.kr:8080/api/lecture/banner");
        const data = await response.json();
        setClassData(data);
      } catch (error) {
        console.error("인기 클래스 불러오지 못함", error);
      }
    };
    console.log(classData, 'classData');
    fetchClassData();
  }, []);

  // 로컬 스토리지에서 최근 검색어 가져오기
  useEffect(() => {
    const storedSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(storedSearches);
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchInput.trim() === "") return;

    const updatedSearches = [
      searchInput,
      ...recentSearches.filter((item) => item !== searchInput),
    ].slice(0, 6); // 최대 5개
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));

    onSearch(searchInput); // 입력된 검색어로 검색

    setSearchInput("");
  };

  // 최근 검색어 개별 삭제
  const removeSearch = (searchToRemove) => {
    const updatedSearches = recentSearches.filter((item) => item !== searchToRemove);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // 최근 검색어 전체 삭제
  const clearRecentSearches = () => {
    localStorage.removeItem("recentSearches");
    setRecentSearches([]);
  };

  // 검색 API 호출
  const onSearch = async (searchToExecute) => {
    const searchQuery = searchToExecute || searchInput; 
    const baseUrl = `https://sangsang2.kr:8080/api/lecture/search?keyword=${searchQuery}`;

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
        searchCount: course.searchCount, // 검색 횟수
        averageScore: course.averageScore, // 리뷰 평점
        scoreCount: course.scoreCount, // 리뷰 수
        imageUrls:
          Array.isArray(course.imageUrl) && course.imageUrl.length > 0
            ? course.imageUrl[0].imageUrl
            : defaultImageUrl, // 이미지가 있으면 한 개만 추출, 없으면 디폴트 이미지
      }));

      setCourses(formattedData);
      console.log(formattedData);
      navigate("/searchList", { state: { formattedData } });
    } catch (error) {
      console.error("Error occurred during delete:", error);
      alert("Error occurred " + error.message);
    }
  };

  return (
    <div id="mobile-view">
      <header className="app-header reviewHeader defaultHeader">
        <Link to="/home">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </Link>
        <h3>검색</h3>
      </header>
      <main id="default-padding" className="searchMain">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            <span className="material-symbols-outlined">search</span>
          </button>
        </form>
        <section className="recent-searches">
          <div className="recentHeader">
            <h4>최근 검색</h4>
            <span onClick={clearRecentSearches} className="material-symbols-outlined">
              delete
            </span>
          </div>
          <div className="recent-tags">
            {recentSearches.map((search, index) => (
              <div key={index} className="search-tag">
                <p onClick={() => onSearch(search)}>{search}</p>
                <button
                  className="remove-search-button"
                  onClick={() => removeSearch(search)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="popularContainer">
          <h4>인기 클래스</h4>
          <div className="popularContent">
            {classData.map((item) => (
              <Link 
                className="popularItem" 
                key={item.id} 
                to={`/home/class_application/${item.id}`}
              >
                <div className="itemTitle">
                  <p>{item.category}</p>
                  <h5>{item.name}</h5>
                  <p>{item.type} • {item.date}</p>
                </div>
                <img
                  src={`${item.imageUrl || `https://via.placeholder.com/100`}`}
                  alt={item.name}
                />
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Navbar />
    </div>
  );
};

export default SearchPage;


