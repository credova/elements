export default function AccountHolderTypeSelect({ required = false }: { required?: boolean }) {
  return (
    <div>
      <label htmlFor="name" className="block">
        Account holder type {required ? '' : '(Optional)'}
      </label>
      <div className="mt-2">
        <select
          name="account_holder_type"
          id="account_holder_type"
          className="block w-full rounded-lg bg-white px-4 py-3 shadow-sm placeholder:text-gray-400 focus:outline-hidden"
          required={required}
        >
          <option value="">Select account holder type</option>
          <option value="individual">Individual</option>
          <option value="company">Company</option>
        </select>
      </div>
    </div>
  );
}
