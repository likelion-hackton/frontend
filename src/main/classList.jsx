import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Navbar from "./navbar";
import { categoryMap, classTypeMap } from "../utils/mappings";
import "./css/class_list.css";

const ClassList = () => {
  const [classData, setClassData] = useState([]);
  const location = useLocation();
  const [selectedClassType, setSelectedClassType] = useState(
    location.state?.selectedClassType || "allClass"
  );
  const [selectedCategory, setSelectedCategory] = useState(
    location.state?.selectedCategory || "ALL"
  );

  const navigate = useNavigate();

  const fetchClassData = async (category, classType) => {
    try {
      const response = await fetch(
        `http://sangsang2.kr:8080/api/lecture/category?category=${category}`
      );
      const data = await response.json();

      const transformedData = data
        .filter(
          (lecture) => classType === "allClass" || lecture.type === classType
        )
        .map((lecture) => ({
          id: lecture.id,
          title: lecture.name,
          price: `₩ ${lecture.price.toLocaleString()}`,
          image:
            lecture.imageUrl?.[0]?.imageUrl ||
            "https://via.placeholder.com/100",
        }));
      setClassData(transformedData);
    } catch (error) {
      console.error("Error fetching class data:", error);
    }
  };

  useEffect(() => {
    if (selectedCategory && selectedClassType) {
      fetchClassData(selectedCategory, selectedClassType);
    }
  }, [selectedCategory, selectedClassType]);

  const handleClassItemClick = (id) => {
    navigate(`/home/class_application/${id}`);
  };

  return (
    <div id="mobile-view">
      <header className="classListHeader">
        <div className="headerTop">
          <Link to="/home">
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </Link>
          <select
            name="classType"
            className="classSelect"
            value={selectedClassType}
            onChange={(e) => setSelectedClassType(e.target.value)}
          >
            {Object.keys(classTypeMap).map((type) => (
              <option key={type} value={classTypeMap[type]}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="headerCategories">
          <p className="categoryTxt categoryTitle">카테고리</p>
          <ul className="categoryList">
            {Object.keys(categoryMap).map((list, i) => (
              <li
                key={i}
                className={`${
                  categoryMap[list] === selectedCategory ? "active" : ""
                } categoryTxt`}
                onClick={() => setSelectedCategory(categoryMap[list])}
              >
                {list}
              </li>
            ))}
          </ul>
        </div>
      </header>
      <main className="classListMain">
        <section className="classListContainer">
          {classData.length === 0 ? (
            <p className="noClassMessage">등록된 클래스가 없습니다.</p>
          ) : (
            classData.map((classItem) => (
              <div
                key={classItem.id}
                className="classItem"
                onClick={() => handleClassItemClick(classItem.id)}
              >
                <img
                  src={classItem.image}
                  className="classImage"
                  alt={classItem.title}
                />
                <div className="classInfo">
                  <h4 className="classTitle">{classItem.title}</h4>
                  <p className="classPrice">{classItem.price}</p>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
      <Navbar />
    </div>
  );
};

export default ClassList;
