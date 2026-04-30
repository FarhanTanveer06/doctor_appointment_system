export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-8">
          <p className="text-lg mb-4">
            Welcome to the Doctor Appointment System - your trusted platform for booking appointments with qualified healthcare professionals.
          </p>
          <p className="text-lg mb-4">
            We connect patients with doctors across various specialties including General Physicians, Dermatologists, Pediatricians, Neurologists, Gastroenterologists, and Cardiologists.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg mb-4">
            To provide easy access to quality healthcare by enabling seamless appointment booking between patients and doctors.
          </p>
          <h2 className="text-2xl font-semibold mb-4">Why Choose Us?</h2>
          <ul className="list-disc list-inside text-lg mb-4">
            <li>Wide network of specialist doctors</li>
            <li>Easy online booking</li>
            <li>Real-time appointment confirmations</li>
            <li>Secure and confidential</li>
            <li>24/7 availability</li>
          </ul>
        </div>
      </div>
    </div>
  );
}