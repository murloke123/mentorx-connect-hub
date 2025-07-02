import EnrollmentChart from '@/components/shared/EnrollmentChart';

const AnalyticsSection = () => {
  return (
    <div className="mb-8 grid gap-6 grid-cols-4">
      <div className="col-span-4">
        <EnrollmentChart />
      </div>
    </div>
  );
};

export default AnalyticsSection;
