import Header from '@/components/Header';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Book Reviews" />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              Welcome to Book Reviews! Please log in to continue.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}