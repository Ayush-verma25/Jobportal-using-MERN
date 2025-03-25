import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios, { AxiosError } from 'axios';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import { setSingleCompany } from '@/redux/companySlice';

// Define types
interface CompanyResponse {
  success: boolean;
  message: string;
  company: {
    _id: string;
    name: string;
  };
}

interface ErrorResponse {
  message?: string;
}

const CompanyCreate: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [companyName, setCompanyName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const registerNewCompany = useCallback(async () => {
    if (!companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post<CompanyResponse>(
        `${COMPANY_API_END_POINT}/register`,
        { companyName },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        dispatch(setSingleCompany(res.data.company));
        toast.success(res.data.message);
        navigate(`/admin/companies/${res.data.company._id}`);
      } else {
        throw new Error('Registration failed');
      }
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage = error.response?.data?.message || 'Failed to register company';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [companyName, dispatch, navigate]);

  const handleCancel = useCallback(() => {
    navigate('/admin/companies');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="my-10">
          <h1 className="font-bold text-2xl text-gray-900">Your Company Name</h1>
          <p className="text-gray-500 mt-1">
            What would you like to name your company? You can change this later.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              type="text"
              className="mt-1"
              placeholder="JobHunt, Microsoft etc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3 mt-10">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              onClick={registerNewCompany}
              disabled={isLoading || !companyName.trim()}
              className="min-w-[100px]"
            >
              {isLoading ? 'Creating...' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCreate;
