import Loader from './Loader';

export default function SubmitButton({
  loading,
  elementType,
}: {
  loading?: boolean;
  elementType?: 'card' | 'bankAccount';
}) {
  return (
    <button
      type="submit"
      className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 focus-visible:outline-solid"
    >
      {loading ? <Loader /> : elementType === 'bankAccount' ? 'Create bank account' : 'Create card'}
    </button>
  );
}
