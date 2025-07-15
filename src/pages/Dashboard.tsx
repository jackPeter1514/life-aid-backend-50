
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building2, TestTube, User, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";


const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchAppointments();
    }
  }, [user, authLoading, navigate]);

  const fetchAppointments = async () => {
    try {
      if (!user) return;
      
      // Get appointments from localStorage
      const storedAppointments = localStorage.getItem('appointments');
      if (storedAppointments) {
        const appointments = JSON.parse(storedAppointments);
        // Filter appointments for current user
        const userAppointments = appointments.filter((apt: any) => apt.patient_id === user.id);
        
        // Add mock center and test details for display
        const enrichedAppointments = userAppointments.map((apt: any) => ({
          ...apt,
          diagnostic_centers: { 
            name: getCenterName(apt.diagnostic_center_id),
            address: getCenterAddress(apt.diagnostic_center_id)
          },
          diagnostic_tests: { 
            name: getTestName(apt.test_id),
            price: apt.total_amount,
            category: getTestCategory(apt.test_id),
            duration: getTestDuration(apt.test_id)
          }
        }));
        
        setAppointments(enrichedAppointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTestName = (testId: string) => {
    const tests = {
      '1': 'Complete Blood Count (CBC)',
      '2': 'Lipid Profile',
      '3': 'Thyroid Function Test (TSH, T3, T4)',
      '4': 'Liver Function Test (LFT)',
      '5': 'Kidney Function Test (KFT)',
      '6': 'Diabetes Panel (HbA1c, Glucose)',
      '7': 'Vitamin D Test',
      '8': 'Vitamin B12 & Folate',
      '9': 'Chest X-Ray',
      '10': 'Spine X-Ray (Cervical)',
      '11': 'Knee X-Ray (Both Knees)',
      '12': 'Pelvis X-Ray',
      '13': 'Shoulder X-Ray',
      '14': 'CT Scan - Head',
      '15': 'CT Scan - Chest',
      '16': 'CT Scan - Abdomen',
      '17': 'CT Scan - Spine',
      '18': 'MRI - Brain',
      '19': 'MRI - Knee Joint',
      '20': 'MRI - Spine (Lumbar)',
      '21': 'MRI - Cardiac',
      '22': 'Ultrasound - Abdomen',
      '23': 'Ultrasound - Pelvis',
      '24': 'Ultrasound - Thyroid',
      '25': 'Echocardiogram (2D Echo)',
      '26': 'ECG (Electrocardiogram)',
      '27': 'Stress Test (TMT)',
      '28': 'Pulmonary Function Test (PFT)',
      '29': 'Bone Density Scan (DEXA)',
      '30': 'Mammography',
      '31': 'Complete Urine Analysis',
      '32': 'Urine Culture & Sensitivity',
      '33': 'Stool Analysis',
      '34': 'Stool Culture',
      '35': 'Upper GI Endoscopy',
      '36': 'Colonoscopy'
    };
    return tests[testId as keyof typeof tests] || 'Unknown Test';
  };

  const getTestCategory = (testId: string) => {
    const categories = {
      '1': 'Blood Test', '2': 'Blood Test', '3': 'Blood Test', '4': 'Blood Test', '5': 'Blood Test', '6': 'Blood Test', '7': 'Blood Test', '8': 'Blood Test',
      '9': 'X-Ray', '10': 'X-Ray', '11': 'X-Ray', '12': 'X-Ray', '13': 'X-Ray',
      '14': 'CT Scan', '15': 'CT Scan', '16': 'CT Scan', '17': 'CT Scan',
      '18': 'MRI Scan', '19': 'MRI Scan', '20': 'MRI Scan', '21': 'MRI Scan',
      '22': 'Ultrasound', '23': 'Ultrasound', '24': 'Ultrasound', '25': 'Ultrasound',
      '26': 'Cardiology', '27': 'Cardiology', '28': 'Pulmonology', '29': 'Radiology', '30': 'Radiology',
      '31': 'Urine Test', '32': 'Urine Test', '33': 'Stool Test', '34': 'Stool Test',
      '35': 'Endoscopy', '36': 'Endoscopy'
    };
    return categories[testId as keyof typeof categories] || 'General';
  };

  const getCenterName = (centerId: string) => {
    const centers = {
      '1': 'Apollo Diagnostics',
      '2': 'Max Healthcare Labs',
      '3': 'Fortis Imaging Center',
      '4': 'Medanta Diagnostic Hub',
      '5': 'AIIMS Diagnostic Center',
      '6': 'Manipal PathLab',
      '7': 'SRL Diagnostics',
      '8': 'Dr. Lal PathLabs'
    };
    return centers[centerId as keyof typeof centers] || 'Unknown Center';
  };

  const getCenterAddress = (centerId: string) => {
    const addresses = {
      '1': '123 Medical Plaza, Downtown',
      '2': '456 Health Avenue, Central City',
      '3': '789 Wellness Street, Medical District',
      '4': '321 Care Boulevard, Health City',
      '5': '654 Research Road, Medical Campus',
      '6': '987 Laboratory Lane, Science Park',
      '7': '147 Test Center Road, Bio Valley',
      '8': '258 Pathology Plaza, Medical Hub'
    };
    return addresses[centerId as keyof typeof addresses] || 'Unknown Address';
  };

  const getTestDuration = (testId: string) => {
    const durations = {
      '1': '30 mins', '2': '45 mins', '3': '60 mins', '4': '45 mins', '5': '40 mins', '6': '35 mins', '7': '30 mins', '8': '30 mins',
      '9': '15 mins', '10': '20 mins', '11': '25 mins', '12': '20 mins', '13': '15 mins',
      '14': '30 mins', '15': '45 mins', '16': '60 mins', '17': '40 mins',
      '18': '90 mins', '19': '75 mins', '20': '80 mins', '21': '120 mins',
      '22': '30 mins', '23': '25 mins', '24': '20 mins', '25': '45 mins',
      '26': '15 mins', '27': '60 mins', '28': '45 mins', '29': '30 mins', '30': '30 mins',
      '31': '15 mins', '32': '24 hours', '33': '20 mins', '34': '48 hours',
      '35': '45 mins', '36': '60 mins'
    };
    return durations[testId as keyof typeof durations] || '30 mins';
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary">HealthCare System</Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">{user?.name || user?.email}</span>
              <Badge variant="secondary">{user?.role || 'Patient'}</Badge>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Welcome to Your Dashboard</h1>
          <div className="text-sm text-muted-foreground">
            Logged in as: {user?.name || user?.email}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Book Appointment</CardTitle>
              <CardDescription>Schedule a new diagnostic appointment</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/appointments/book">
                <Button className="w-full">Book Now</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Building2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Find Centers</CardTitle>
              <CardDescription>Browse diagnostic centers near you</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/centers">
                <Button className="w-full" variant="outline">Browse</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <TestTube className="h-8 w-8 text-primary mb-2" />
              <CardTitle>View Tests</CardTitle>
              <CardDescription>Explore available diagnostic tests</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/tests">
                <Button className="w-full" variant="outline">View Tests</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Your latest appointment bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No appointments found. Ready to book your first appointment?
                </p>
                <Link to="/appointments/book">
                  <Button>Book Your First Appointment</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-6 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <TestTube className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold text-lg">{appointment.diagnostic_tests?.name}</h4>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{appointment.diagnostic_centers?.name}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(appointment.appointment_date), "PPP")}</span>
                        </div>
                        <span>•</span>
                        <span>{appointment.appointment_time}</span>
                        <span>•</span>
                        <span className="font-medium text-primary">₹{appointment.total_amount}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Category: {appointment.diagnostic_tests?.category} • Duration: {appointment.diagnostic_tests?.duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(appointment.status)} text-white`}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
