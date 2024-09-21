import { React, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // useNavigate 추가
import Slider from "react-slick";
import Navbar from "./navbar";
import "./css/navbar.css";
import "./css/home_main.css";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { categoryMap, classTypeMap } from "../utils/mappings";

function Home() {
  const [banners, setBanners] = useState([]);
  const navigate = useNavigate(); 

  useEffect(() => { // 배너 가져오기
    const fetchBanners = async () => {
      try {
        const response = await fetch("https://sangsang2.kr:8080/api/lecture/banner");
        const data = await response.json();
        console.log(data)
        setBanners(data);
      } catch (error) {
        console.error("배너 불러오지 못함", error);
      }
    };

    fetchBanners();
    console.log(banners);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    arrows: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2300
  };

  // 배너 클릭 시 이동
  const handleBannerClick = (id) => {
    navigate(`/home/class_application/${id}`); 
  };

  return (
    <div id="mobile-view" className="homeBackground">
      <div id="default-padding">
        <header className="homeHeader">
          <h3>MOMENT CLASS</h3>
        </header>
        <div className="mainContent">
          <section className="classTypeContainer">
            <h4 className="classTxt">클래스 유형</h4>
            <div className="classTypeBox">
              {Object.keys(classTypeMap).map((type) => (
                <Link
                  key={type}
                  className={`typeContent ${classTypeMap[type]}`}
                  to="/home/class_list"
                  state={{ selectedClassType: classTypeMap[type], selectedCategory: 'ALL', categoryMap, classTypeMap }}
                >
                  <p>{type}</p>
                </Link>
              ))}
            </div>
          </section>
          <section className="bestClassContainer">
            <h4 className="classTxt">인기 클래스</h4>
            <Slider {...settings} className="banner">
              {banners.length > 0 ? (
                banners.map((banner) => (
                  <div
                    className="bannerImgWrapper"
                    key={banner.id}
                    onClick={() => handleBannerClick(banner.id)}
                  >
                    <img
                      src={banner.imageUrl || "https://via.placeholder.com/338x150"}
                      alt={banner.name || "Banner"}
                      className="bannerImg"
                    />
                    <div className="bannerTxtBox">
                      <h4>{banner.name}</h4>
                      <p>{banner.type == "OneDay" ? banner.date : `${banner.startDate} ~ ${banner.endDate}`}</p>
                      <p>{banner.type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div>인기 클래스 불러오지 못함</div>
              )}
            </Slider>
          </section>
          <section className="categoryContainer">
            <h4 className="classTxt">카테고리</h4>
            <ul className="categoryBox">
              {Object.keys(categoryMap).map((key, i) => (
                <Link
                  key={i}
                  to="/home/class_list"
                  state={{ selectedCategory: categoryMap[key], categoryMap, classTypeMap }}
                >
                  <li className={`${categoryMap[key]} categoryHomeList`}>
                    {key}
                    <p className={`${categoryMap[key]}_p categorySubTxt`}>
                      {categoryMap[key].charAt(0).toUpperCase() + categoryMap[key].slice(1).toLowerCase()}
                    </p>
                  </li>
                </Link>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <Navbar />
    </div>
  );
}

export default Home;








// import { React } from "react";
// import { Link } from "react-router-dom";
// import Slider from "react-slick";
// import Navbar from "./navbar";
// import "./css/navbar.css";
// import "./css/home_main.css";
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

// function Home() {
//   const category = [
//     {text: '전체' , className: 'ALL'},
//     {text: '요리' , className: 'COOK'},
//     {text: '미술' , className: 'ART'},
//     {text: '공예' , className: 'CRAFT'},
//     {text: '원예' , className: 'GARDENING'},
//     {text: '뷰티' , className: 'BEAUTY'},
//     {text: '음악' , className: 'MUSIC'},
//     {text: '운동' , className: 'EXERCISE'},
//   ];

//   const classTypes = [
//     { type: "전체", className: "allType", state: "allClass" },
//     { type: "정규", className: "regularType", state: "Regular" },
//     { type: "원데이", className: "onedayType", state: "OneDay" }
//   ];

//   const settings = { // 배너 세팅
//     dots: true,
//     infinite: true,
//     speed: 500,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 2300
//   };

//   return (
//     <div id="mobile-view">
//       <div id="default-padding">
//         <header className="homeHeader">
//           <h3>MOMENT CLASS</h3>
//         </header>
//         <div className="mainContent">
//           <section className="classTypeContainer">
//             <h4 className="classTxt">클래스 유형</h4>
//             <div className="classTypeBox">
//               {classTypes.map((item, index) => (
//                 <Link
//                   key={index}
//                   className={`typeContent ${item.className}`}
//                   to="/home/class_list"
//                   state={{ selectedClassType: item.state, selectedCategory: 'ALL' }}
//                 >
//                   <p>{item.type}</p>
//                 </Link>
//               ))}
//             </div>
//           </section>
//           <section className="bestClassContainer">
//             <h4 className="classTxt">인기 클래스</h4>
//             <Slider {...settings} className="banner">
//               <div>
//                 <img src="https://via.placeholder.com/338x150" alt="배너 1" />
//               </div>
//               <div>
//                 <img src="https://via.placeholder.com/338x150" alt="배너 2" />
//               </div>
//               <div>
//                 <img src="https://via.placeholder.com/338x150" alt="배너 3" />
//               </div>
//             </Slider>
//           </section>
//           <section className="categoryContainer">
//             <h4 className="classTxt">카테고리</h4>
//             <ul className="categoryBox">
//               {category.map((item, i) => (
//                 <Link
//                   key={i}
//                   to="/home/class_list"
//                   state={{ selectedCategory: item.className }}
//                 >
//                   <li className={`${item.className} categoryHomeList`}>
//                     {item.text}
//                   </li>
//                 </Link>
//               ))}
//             </ul>
//           </section>
//         </div>
//       </div>
//       <Navbar />
//     </div>
//   );
// }

// export default Home;