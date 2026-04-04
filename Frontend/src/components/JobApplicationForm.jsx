import { useState } from 'react';
import { useAuth } from '../lib/AuthContext';

const JobApplicationForm = ({ job, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    coverLetter: '',
    resumeFile: null,
    additionalInfo: '',
    availableStartDate: '',
    expectedSalary: '',
    portfolioUrl: '',
    linkedinUrl: '',
    githubUrl: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString().split('T')[0];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'resumeFile') {
      setFormData(prev => ({ ...prev, [name]: files[0] || null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.coverLetter.trim()) {
      newErrors.coverLetter = 'Cover letter is required';
    } else if (formData.coverLetter.trim().length < 50) {
      newErrors.coverLetter = 'Cover letter must be at least 50 characters';
    }
    
    if (!formData.resumeFile) {
      newErrors.resumeFile = 'Resume file is required';
    } else if (formData.resumeFile.size > 5 * 1024 * 1024) {
      newErrors.resumeFile = 'Resume file must be less than 5MB';
    } else if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(formData.resumeFile.type)) {
      newErrors.resumeFile = 'Resume must be a PDF or Word document';
    }
    
    if (!formData.availableStartDate) {
      newErrors.availableStartDate = 'Available start date is required';
    } else if (formData.availableStartDate < today) {
      newErrors.availableStartDate = 'Start date cannot be in the past';
    }
    
    if (formData.expectedSalary) {
      const salaryValue = Number(formData.expectedSalary);
      if (Number.isNaN(salaryValue) || salaryValue < 0) {
        newErrors.expectedSalary = 'Expected salary must be a valid number';
      }
    }
    
    if (formData.portfolioUrl && !isValidUrl(formData.portfolioUrl)) {
      newErrors.portfolioUrl = 'Please enter a valid URL';
    }
    
    if (formData.linkedinUrl && !isValidUrl(formData.linkedinUrl)) {
      newErrors.linkedinUrl = 'Please enter a valid URL';
    }
    
    if (formData.githubUrl && !isValidUrl(formData.githubUrl)) {
      newErrors.githubUrl = 'Please enter a valid URL';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id || !user?.email || !job?.id) {
      setErrors(prev => ({
        ...prev,
        submit: 'Unable to submit application right now. Please refresh and try again.'
      }));
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const applicationData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          applicationData.append(key, formData[key]);
        }
      });
      
      applicationData.append('jobId', job.id);
      applicationData.append('userId', user.id);
      applicationData.append('userEmail', user.email);
      
      await onSubmit(applicationData);
    } catch (error) {
      console.error('Failed to submit application:', error);
      setErrors(prev => ({
        ...prev,
        submit: error?.message || 'Failed to submit application. Please try again.'
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const formatSalary = (min, max) => {
    if (min == null && max == null) return 'Salary not disclosed';
    if (min != null && max != null) return `$${Number(min).toLocaleString()} - $${Number(max).toLocaleString()}`;
    if (min != null) return `From $${Number(min).toLocaleString()}`;
    return `Up to $${Number(max).toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-800">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Apply for Position</h2>
          <div className="text-slate-300">
            <p className="font-medium">{job.title}</p>
            <p className="text-sm text-slate-400">{job.company?.companyName || job.companyName || 'Company'} • {job.location || 'Location not specified'} • {formatSalary(job.salaryMin, job.salaryMax)}</p>
          </div>
        </div>

        {errors.submit && (
          <div className="mb-4 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="coverLetter" className="block text-sm font-medium text-slate-300 mb-2">
                Cover Letter * <span className="text-xs text-slate-500">(minimum 50 characters)</span>
              </label>
              <textarea
                id="coverLetter"
                name="coverLetter"
                rows={8}
                value={formData.coverLetter}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
                  errors.coverLetter ? 'border-red-500' : 'border-slate-700'
                }`}
                placeholder="Dear Hiring Manager,

I am writing to express my strong interest in the [Position Title] role at [Company Name]. With my background in... 

Please highlight:
• Your relevant experience and skills
• Why you're interested in this specific role
• What you can bring to the company
• Your enthusiasm for the opportunity

Best regards,
[Your Name]"
              />
              {errors.coverLetter && <p className="mt-1 text-sm text-red-400">{errors.coverLetter}</p>}
              <p className="mt-1 text-xs text-slate-500">{formData.coverLetter.length} characters</p>
            </div>
            <div>
              <label htmlFor="resumeFile" className="block text-sm font-medium text-slate-300 mb-2">
                Resume * <span className="text-xs text-slate-500">(PDF or Word, max 5MB)</span>
              </label>
              <input
                type="file"
                id="resumeFile"
                name="resumeFile"
                accept=".pdf,.doc,.docx"
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 ${
                  errors.resumeFile ? 'border-red-500' : 'border-slate-700'
                }`}
              />
              {errors.resumeFile && <p className="mt-1 text-sm text-red-400">{errors.resumeFile}</p>}
            </div>
            <div>
              <label htmlFor="availableStartDate" className="block text-sm font-medium text-slate-300 mb-2">
                Available Start Date *
              </label>
              <input
                type="date"
                id="availableStartDate"
                name="availableStartDate"
                value={formData.availableStartDate}
                min={today}
                max={maxDate}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [color-scheme:dark] ${
                  errors.availableStartDate ? 'border-red-500' : 'border-slate-700'
                }`}
              />
              {errors.availableStartDate && <p className="mt-1 text-sm text-red-400">{errors.availableStartDate}</p>}
            </div>
            <div>
              <label htmlFor="expectedSalary" className="block text-sm font-medium text-slate-300 mb-2">
                Expected Monthly Salary
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">$</span>
                <input
                  type="number"
                  id="expectedSalary"
                  name="expectedSalary"
                  value={formData.expectedSalary}
                  onChange={handleInputChange}
                  className={`w-full pl-8 pr-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.expectedSalary ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="5000"
                  min="0"
                />
              </div>
              {errors.expectedSalary && <p className="mt-1 text-sm text-red-400">{errors.expectedSalary}</p>}
            </div>
            <div>
              <label htmlFor="portfolioUrl" className="block text-sm font-medium text-slate-300 mb-2">
                Portfolio URL
              </label>
              <input
                type="url"
                id="portfolioUrl"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.portfolioUrl ? 'border-red-500' : 'border-slate-700'
                }`}
                placeholder="https://yourportfolio.com"
              />
              {errors.portfolioUrl && <p className="mt-1 text-sm text-red-400">{errors.portfolioUrl}</p>}
            </div>
            <div>
              <label htmlFor="linkedinUrl" className="block text-sm font-medium text-slate-300 mb-2">
                LinkedIn Profile
              </label>
              <input
                type="url"
                id="linkedinUrl"
                name="linkedinUrl"
                value={formData.linkedinUrl}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.linkedinUrl ? 'border-red-500' : 'border-slate-700'
                }`}
                placeholder="https://linkedin.com/in/yourprofile"
              />
              {errors.linkedinUrl && <p className="mt-1 text-sm text-red-400">{errors.linkedinUrl}</p>}
            </div>
            <div>
              <label htmlFor="githubUrl" className="block text-sm font-medium text-slate-300 mb-2">
                GitHub Profile
              </label>
              <input
                type="url"
                id="githubUrl"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.githubUrl ? 'border-red-500' : 'border-slate-700'
                }`}
                placeholder="https://github.com/yourusername"
              />
              {errors.githubUrl && <p className="mt-1 text-sm text-red-400">{errors.githubUrl}</p>}
            </div>
            <div className="md:col-span-2">
              <label htmlFor="additionalInfo" className="block text-sm font-medium text-slate-300 mb-2">
                Additional Information
              </label>
              <textarea
                id="additionalInfo"
                name="additionalInfo"
                rows={4}
                value={formData.additionalInfo}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                placeholder="Any additional information you'd like to share about your qualifications, projects, or why you're interested in this role..."
              />
            </div>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-slate-700">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting Application...
                </>
              ) : (
                'Submit Application'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationForm;
