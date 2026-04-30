export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <p className="text-lg mb-6">
            Have questions or need help? Get in touch with us.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <span className="text-xl mr-4">📍</span>
              <div>
                <h3 className="font-semibold">Address</h3>
                <p>Suvastu Chirontoni, 26 Indira Road, Farmgate</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-xl mr-4">📞</span>
              <div>
                <h3 className="font-semibold">Phone</h3>
                <p>01636656861</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-xl mr-4">✉️</span>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p>farhansarkar10130@gmail.com</p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-xl mr-4">⏰</span>
              <div>
                <h3 className="font-semibold">Hours</h3>
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}