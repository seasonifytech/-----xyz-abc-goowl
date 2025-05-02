import {
  BarChart2Icon,
  BookOpenIcon,
  ChevronDownIcon,
  HomeIcon,
  MoreHorizontalIcon,
  UserIcon,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Separator } from "../../components/ui/separator";
import { getCategories, getCompanies } from "../../services/questionService";
import { useQuestionStore } from "../../store/questionStore";
import { AudioControls } from "../../components/ui/audio-controls";

export const Desktop = (): JSX.Element => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const { setFilters, fetchCompanyQuestions } = useQuestionStore();
  
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const categoriesList = await getCategories();
        const companiesList = await getCompanies();
        
        setCategories(categoriesList);
        setCompanies(companiesList);
      } catch (error) {
        console.error("Error loading filters:", error);
      }
    };
    
    loadFilters();
  }, []);
  
  const handleSelectCompany = (value: string) => {
    if (value === "all") {
      setFilters({});
    } else {
      setFilters({ company: value });
    }
  };
  
  const handleSelectCategory = (value: string) => {
    if (value === "all") {
      setFilters({});
    } else {
      setFilters({ category: value });
    }
  };
  
  const handleSelectDifficulty = (value: string) => {
    if (value === "all") {
      setFilters({});
    } else {
      setFilters({ difficulty: value });
    }
  };

  const handleCompanyCardClick = (company: string) => {
    console.log(`Company card clicked: ${company}`);
    fetchCompanyQuestions(company);
    navigate("/challenge");
  };

  // Leaderboard data
  const leaderboardData = [
    { name: "Nisha", xp: "450 XP" },
    { name: "Raja", xp: "380 XP" },
    { name: "Alisha", xp: "320 XP" },
    { name: "Hemant", xp: "300 XP" },
    { name: "Pooja", xp: "295 XP" },
    { name: "Khushi", xp: "290 XP" },
    { name: "Aditya", xp: "288 XP" },
    { name: "Disha", xp: "272 XP" },
    { name: "Priyanka", xp: "268 XP" },
    { name: "Honey", xp: "255 XP" },
  ];

  // Learning frameworks data
  const frameworksData = [
    "PARADE Framework",
    "STAR Framework",
    "CAR Framework",
    "CIRCLE Framework",
  ];

  // Level cards data
  const levelCardsData = [
    {
      level: "Level 1",
      progress: "2/5",
      description: "Complete 5 questions and unlock Level 2",
      difficulty: "EASY",
      active: true,
    },
    {
      level: "Level 2",
      progress: "0/5",
      description: "Complete 5 questions and unlock Level 3",
      difficulty: "EASY-MED",
      active: false,
    },
    {
      level: "Level 3",
      progress: "0/10",
      description: "Complete 10 questions and unlock Level 4",
      difficulty: "MEDIUM",
      active: false,
    },
    {
      level: "Level 4",
      progress: "0/10",
      description: "Complete 5 questions and unlock Level 2",
      difficulty: "MED-HARD",
      active: false,
    },
    {
      level: "Level 5",
      progress: "0/20",
      description: "Complete 20 questions and become pro",
      difficulty: "HARD",
      active: false,
    },
  ];

  // Company challenge cards data
  const companyCardsData = [
    {
      name: "Google",
      levels: "8 Levels",
      questions: "100 Questions",
      image: "/image.png",
    },
    {
      name: "Apple",
      levels: "8 Levels",
      questions: "110 Questions",
      image: "/image-1.png",
    },
    {
      name: "Meta",
      levels: "7 Levels",
      questions: "95 Questions",
      image: "/image-61.png",
    },
    {
      name: "Netflix",
      levels: "6 Levels",
      questions: "80 Questions",
      image: "/image-2.png",
    },
    {
      name: "Amazon",
      levels: "9 Levels",
      questions: "120 Questions",
      image: "/image-62.png",
    },
    {
      name: "Microsoft",
      levels: "10 Levels",
      questions: "130 Questions",
      image: "/image-3.png",
    },
  ];

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-[1440px] h-[850px] relative overflow-hidden">
        {/* Left Sidebar Navigation - Now fixed */}
        <div className="fixed w-[310px] h-full left-0 top-0 border-r border-gray-200">
          {/* Logo */}
          <div className="w-[133px] h-[34px] ml-[102px] mt-[42px]">
            <div className="relative h-[34px]">
              <img
                className="absolute w-[31px] h-[33px] top-px left-[30px]"
                alt="Subtract"
                src="/subtract.svg"
              />
              <img
                className="absolute w-[133px] h-[33px] top-0 left-0"
                alt="Display"
                src="/display-d1---72---semibold.png"
              />
              <img
                className="absolute w-[21px] h-[17px] top-0 left-[27px]"
                alt="Vector stroke"
                src="/vector-13--stroke-.svg"
              />
              <img
                className="absolute w-[21px] h-[17px] top-0 left-11"
                alt="Vector stroke"
                src="/vector-14--stroke-.svg"
              />
              <img
                className="absolute w-1.5 h-[9px] top-[15px] left-[43px]"
                alt="Ellipse"
                src="/ellipse-2074.svg"
              />
            </div>
          </div>
          
          {/* Quests Tab */}
          <div className="w-[212px] h-[51px] ml-[72px] mt-[40px] bg-[#eee2ff] rounded-xl border border-solid border-[#8b3dff] flex items-center">
            <HomeIcon className="w-6 h-6 ml-[26px] text-primarypurple" />
            <span className="ml-4 text-primarypurple font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)] nav-text">
              Quests
            </span>
          </div>
          
          {/* Navigation Menu */}
          <nav className="ml-[99px] flex flex-col gap-[42px] mt-[40px]">
            <div className="flex items-center">
              <BarChart2Icon className="w-6 h-6" />
              <span className="ml-[36px] text-statebold font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)] nav-text">
                Leaderboard
              </span>
            </div>

            <div className="flex items-center">
              <BookOpenIcon className="w-5 h-4 ml-[2px]" />
              <span className="ml-[34px] text-statebold font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)] nav-text">
                Learn
              </span>
            </div>

            <div className="flex items-center">
              <UserIcon className="w-6 h-6" />
              <span className="ml-[36px] text-statebold font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)] nav-text">
                Profile
              </span>
            </div>
          </nav>
          
          {/* More section */}
          <div className="flex items-center ml-[100px] mt-[300px]">
            <MoreHorizontalIcon className="w-6 h-6" />
            <span className="ml-[35px] text-statebold font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)] nav-text">
              More
            </span>
          </div>
          
          {/* Audio controls */}
          <div className="flex items-center ml-[100px] mt-[30px]">
            <AudioControls />
          </div>
        </div>

        {/* Main Content Area - Now with left margin to accommodate fixed sidebar */}
        <div className="ml-[310px] overflow-y-auto h-full" style={{scrollBehavior: "smooth", willChange: "scroll-position"}}>
          <div className="p-[24px]">
            {/* Stats Icons - repositioned */}
            <div className="flex items-center absolute top-[24px] right-[40px] gap-[40px]">
              <div className="flex flex-col items-center">
                <img
                  className="w-[29px] h-[29px] object-cover"
                  alt="Coin"
                  src="/image-42.png"
                />
                <span className="text-[#fda337] font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)]">
                  0
                </span>
              </div>

              <div className="flex flex-col items-center">
                <img
                  className="w-[35px] h-[35px] object-cover"
                  alt="Diamond"
                  src="/image-44.png"
                />
                <span className="text-[#1407ab] font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)]">
                  0
                </span>
              </div>

              <div className="flex flex-col items-center">
                <img
                  className="w-[29px] h-[29px] object-cover"
                  alt="Heart"
                  src="/image-45.png"
                />
                <span className="text-[#e24c4b] font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)]">
                  0
                </span>
              </div>
            </div>
            
            {/* Main Content Layout */}
            <div className="mt-[40px] flex">
              <div className="w-[610px]">
                {/* Challenge Banner - Left aligned (removed mx-auto) - FIXED Button Spacing */}
                <Card className="w-[610px] h-[80px] mb-[30px] rounded-xl bg-primarypurple border-none">
                  <CardContent className="p-0 flex items-center justify-between h-full">
                    <div className="flex items-center">
                      <img
                        className="w-[65px] h-[65px] ml-[17px] object-cover mascot-animation"
                        alt="Challenge Icon"
                        src="/image-63.png"
                      />
                      <div className="ml-[11px] font-headings-h6 font-[number:var(--headings-h6-font-weight)] text-white text-[length:var(--headings-h6-font-size)] tracking-[var(--headings-h6-letter-spacing)] leading-[var(--headings-h6-line-height)] whitespace-nowrap [font-style:var(--headings-h6-font-style)]">
                        Start your first challenge
                      </div>
                    </div>
                    <Link to="/challenge">
                      <Button className="w-[110px] h-10 mr-[29px] bg-white text-primarypurple text-lg font-semibold shadow-[0px_4px_0px_#e4e4e4] rounded-[10px] [font-family:'Quicksand',Helvetica] hover:bg-gray-100 active:translate-y-1 active:shadow-[0px_2px_0px_#e4e4e4] transition-all">
                        START
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Filter Selects - Removed duplicate dropdown icons */}
                <div className="flex gap-5 mb-[30px]">
                  <Select onValueChange={handleSelectCompany}>
                    <SelectTrigger className="w-[190px] h-[40px] bg-primaryteal text-white font-bold rounded-xl border-none">
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Companies</SelectItem>
                      {companies.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select onValueChange={handleSelectCategory}>
                    <SelectTrigger className="w-[139px] h-[40px] bg-primaryteal text-white font-bold rounded-xl border-none">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select onValueChange={handleSelectDifficulty}>
                    <SelectTrigger className="w-[176px] h-[40px] bg-primaryteal text-white font-bold rounded-xl border-none">
                      <SelectValue placeholder="Difficulty level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Level Cards - First Row with increased spacing */}
                <div className="grid grid-cols-3 gap-5 mb-[24px]">
                  {levelCardsData.slice(0, 3).map((level, index) => (
                    <Link 
                      key={index} 
                      to={index === 0 ? "/challenge" : "#"}
                      className={index === 0 ? "cursor-pointer" : "cursor-not-allowed"}
                    >
                      <Card
                        className={`w-[190px] h-[120px] rounded-xl border border-solid ${level.active ? "bg-[#eee2ff] border-[#8b3dff]" : "bg-[#f7f7f7] border-[#d0d0d0]"}`}
                      >
                        <CardContent className="p-3 relative h-full flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <h3 className="font-title font-[number:var(--title-font-weight)] text-statebold text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)]">
                              {level.level}
                            </h3>
                            <img
                              className="w-[34px] h-[34px] object-cover"
                              alt="Level Icon"
                              src={index === 2 ? "/image-52.png" : "/image-54.png"}
                            />
                          </div>
                          <p className="mt-1 [font-family:'Quicksand',Helvetica] font-medium text-statebold text-xs tracking-[0] leading-[15px]">
                            {level.description}
                          </p>
                          <div className="flex justify-between items-center w-full mt-1">
                            <span className="text-statebold font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)]">
                              {level.progress}
                            </span>
                            <Button
                              variant="outline"
                              className="h-[24px] px-2 bg-white border-neutral-200 shadow-[0px_4px_0px_#e4e4e4] rounded-[10px] [font-family:'Quicksand',Helvetica] font-semibold text-[#4b4b4b] text-xs hover:bg-gray-100 active:translate-y-1 active:shadow-[0px_2px_0px_#e4e4e4] transition-all"
                            >
                              {level.difficulty}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Level Cards - Second Row */}
                <div className="grid grid-cols-3 gap-5 mb-[30px]">
                  {levelCardsData.slice(3, 5).map((level, index) => (
                    <Card
                      key={index}
                      className="w-[190px] h-[120px] bg-[#f7f7f7] rounded-xl border border-solid border-[#d0d0d0]"
                    >
                      <CardContent className="p-3 relative h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h3 className="font-title font-[number:var(--title-font-weight)] text-statebold text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)]">
                            {level.level}
                          </h3>
                          <img
                            className="w-[34px] h-[34px] object-cover"
                            alt="Level Icon"
                            src={index === 1 ? "/image-55.png" : "/image-54.png"}
                          />
                        </div>
                        <p className="mt-1 [font-family:'Quicksand',Helvetica] font-medium text-statebold text-xs tracking-[0] leading-[15px]">
                          {level.description}
                        </p>
                        <div className="flex justify-between items-center w-full mt-1">
                          <span className="text-statebold font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)]">
                            {level.progress}
                          </span>
                          <Button
                            variant="outline"
                            className="h-[24px] px-2 bg-white border-neutral-200 shadow-[0px_4px_0px_#e4e4e4] rounded-[10px] [font-family:'Quicksand',Helvetica] font-semibold text-[#4b4b4b] text-xs hover:bg-gray-100 active:translate-y-1 active:shadow-[0px_2px_0px_#e4e4e4] transition-all"
                          >
                            {level.difficulty}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Company Challenges Section */}
                <div className="mb-[20px] flex justify-between items-center">
                  <h2 className="text-statebold font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)]">
                    Complete levels of Top Tech companies
                  </h2>

                  <Button className="w-[88px] h-[28px] bg-primarypurple shadow-[0px_4px_0px_#411288] rounded-[10px] text-white text-xs font-semibold [font-family:'Quicksand',Helvetica] hover:bg-[#7b35e0] active:translate-y-1 active:shadow-[0px_2px_0px_#411288] transition-all">
                    VIEW MORE
                  </Button>
                </div>

                {/* Company Cards - First Row */}
                <div className="grid grid-cols-3 gap-5 mb-[20px]">
                  {companyCardsData.slice(0, 3).map((company, index) => (
                    <Card
                      key={index}
                      className="w-[190px] h-[125px] rounded-xl border border-solid border-[#d0d0d0]"
                    >
                      <CardContent className="p-3 relative h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h3 className="font-title font-[number:var(--title-font-weight)] text-statebold text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)]">
                            {company.name}
                          </h3>
                          <img
                            className={`${index === 2 ? "w-12 h-11" : index === 4 ? "w-[78px] h-11" : "w-[34px] h-[34px]"} object-cover`}
                            alt={`${company.name} logo`}
                            src={company.image}
                          />
                        </div>
                        <p className="mt-1 [font-family:'Quicksand',Helvetica] font-medium text-statebold text-xs tracking-[0] leading-[15px]">
                          {company.levels}
                          <br />
                          {company.questions}
                        </p>
                        <Button 
                          className="w-full h-[28px] bg-white border-neutral-200 shadow-[0px_4px_0px_#e4e4e4] rounded-[10px] [font-family:'Quicksand',Helvetica] font-semibold text-primarypurple text-xs hover:bg-gray-100 active:translate-y-1 active:shadow-[0px_2px_0px_#e4e4e4] transition-all"
                          onClick={() => handleCompanyCardClick(company.name)}
                        >
                          START CHALLENGE
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Company Cards - Second Row */}
                <div className="grid grid-cols-3 gap-5">
                  {companyCardsData.slice(3, 6).map((company, index) => (
                    <Card
                      key={index}
                      className="w-[190px] h-[125px] rounded-xl border border-solid border-[#d0d0d0]"
                    >
                      <CardContent className="p-3 relative h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <h3 className="font-title font-[number:var(--title-font-weight)] text-statebold text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)]">
                            {company.name}
                          </h3>
                          <img
                            className="w-[34px] h-[34px] object-cover"
                            alt={`${company.name} logo`}
                            src={company.image}
                          />
                        </div>
                        <p className="mt-1 [font-family:'Quicksand',Helvetica] font-medium text-statebold text-xs tracking-[0] leading-[15px]">
                          {company.levels}
                          <br />
                          {company.questions}
                        </p>
                        <Button 
                          className="w-full h-[28px] bg-white border-neutral-200 shadow-[0px_4px_0px_#e4e4e4] rounded-[10px] [font-family:'Quicksand',Helvetica] font-semibold text-primarypurple text-xs hover:bg-gray-100 active:translate-y-1 active:shadow-[0px_2px_0px_#e4e4e4] transition-all"
                          onClick={() => handleCompanyCardClick(company.name)}
                        >
                          START CHALLENGE
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Right Side Cards - Now with specific right alignment and top margin to avoid overlap */}
              <div className="ml-auto w-[295px] mt-[80px]">
                {/* Leaderboard Card */}
                <Card className="w-[295px] h-[400px] rounded-xl border border-solid border-[#00c4cc] mb-[20px]">
                  <CardContent className="p-5 relative h-full flex flex-col">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-statebold font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)]">
                        Leaderboard
                      </h3>
                      <span className="font-medium text-primaryteal text-xs whitespace-nowrap [font-family:'Quicksand',Helvetica] tracking-[0] leading-[17px]">
                        This week
                      </span>
                    </div>

                    <div className="flex-grow space-y-[16px] mb-4 overflow-y-auto">
                      {leaderboardData.map((user, index) => (
                        <div key={index} className="flex justify-between items-center py-1">
                          <span className="font-semibold text-statebold text-base whitespace-nowrap [font-family:'Quicksand',Helvetica] tracking-[0] leading-[17px]">
                            {user.name}
                          </span>
                          <span className="font-semibold text-statebold text-base text-right whitespace-nowrap [font-family:'Quicksand',Helvetica] tracking-[0] leading-[17px]">
                            {user.xp}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button className="w-[180px] self-center h-[28px] mt-auto bg-primarypurple shadow-[0px_4px_0px_#411288] rounded-[10px] text-white text-xs font-semibold [font-family:'Quicksand',Helvetica] hover:bg-[#7b35e0] active:translate-y-1 active:shadow-[0px_2px_0px_#411288] transition-all">
                      VIEW LEADERBOARD
                    </Button>
                  </CardContent>
                </Card>

                {/* Learn Card */}
                <Card className="w-[295px] h-[230px] rounded-xl border border-solid border-[#00c4cc]">
                  <CardContent className="p-5 relative h-full flex flex-col">
                    <h3 className="text-statebold font-title font-[number:var(--title-font-weight)] text-[length:var(--title-font-size)] tracking-[var(--title-letter-spacing)] leading-[var(--title-line-height)] whitespace-nowrap [font-style:var(--title-font-style)] mb-3">
                      Learn
                    </h3>

                    <div className="space-y-[8px]">
                      {frameworksData.map((framework, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full h-[34px] bg-white border-[#d0d0d0] shadow-[0px_4px_0px_#e4e4e4] rounded-[10px] [font-family:'Quicksand',Helvetica] font-semibold text-[#4b4b4b] text-base hover:bg-gray-100 active:translate-y-1 active:shadow-[0px_2px_0px_#e4e4e4] transition-all"
                        >
                          {framework}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};