import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { getCompanies } from '../../services/questionService';

export const CompanyListPage = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const companiesList = await getCompanies();
        setCompanies(companiesList);
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanies();
  }, []);

  const companyLogos: Record<string, string> = {
    'Google': '/image.png',
    'Apple': '/image-1.png',
    'Meta': '/image-61.png',
    'Netflix': '/image-2.png',
    'Amazon': '/image-62.png',
    'Microsoft': '/image-3.png'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b3dff]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <Button 
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 border rounded-full pl-4 pr-6 py-2 text-[#8b3dff] border-[#8b3dff] hover:bg-[#f9f5ff]"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span className="font-semibold">BACK</span>
        </Button>

        <h1 className="text-3xl font-bold mb-8">Top Tech Companies Interview Questions</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card
              key={company}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/companies/${encodeURIComponent(company)}`)}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">{company}</h2>
                {companyLogos[company] && (
                  <img 
                    src={companyLogos[company]} 
                    alt={`${company} logo`} 
                    className="w-8 h-8 object-contain"
                  />
                )}
              </div>
              <p className="text-gray-600 text-sm">
                Click to view interview questions
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};