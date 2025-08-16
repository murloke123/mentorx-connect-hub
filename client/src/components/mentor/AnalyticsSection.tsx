import EnrollmentChart from '@/components/shared/EnrollmentChart';

const AnalyticsSection = () => {
  return (
    <div className="mb-6 md:mb-8 grid gap-4 md:gap-6 grid-cols-1">
      <div className="col-span-1">
        <EnrollmentChart />
      </div>
    </div>
  );
};

export default AnalyticsSection;
