import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { DiagnosticCenter, DiagnosticTest } from "@/lib/supabase";


const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30"
];

const BookAppointment = () => {
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedTest, setSelectedTest] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [date, setDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [patientNotes, setPatientNotes] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  // Check authentication only after loading is complete
  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "Please login to book an appointment",
        variant: "destructive",
      });
      navigate('/login?returnTo=/appointments/book&action=book');
    }
  }, [user, authLoading, navigate, toast]);

  useEffect(() => {
    fetchCenters();
  }, []);

  useEffect(() => {
    if (selectedCenter) {
      fetchTestsByCenter(selectedCenter);
    }
  }, [selectedCenter]);

  useEffect(() => {
    if (selectedCenter && date) {
      fetchBookedSlots(selectedCenter, date);
    }
  }, [selectedCenter, date]);

  const fetchCenters = async () => {
    try {
      // Comprehensive mock diagnostic centers data
      const mockCenters = [
        { id: '1', name: 'Apollo Diagnostics', address: '123 Medical Plaza, Downtown', phone: '123-456-7890', email: 'info@apollodiag.com', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '2', name: 'Max Healthcare Labs', address: '456 Health Avenue, Central City', phone: '123-456-7891', email: 'contact@maxlabs.com', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '3', name: 'Fortis Imaging Center', address: '789 Wellness Street, Medical District', phone: '123-456-7892', email: 'support@fortisimaging.com', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '4', name: 'Medanta Diagnostic Hub', address: '321 Care Boulevard, Health City', phone: '123-456-7893', email: 'info@medantahub.com', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '5', name: 'AIIMS Diagnostic Center', address: '654 Research Road, Medical Campus', phone: '123-456-7894', email: 'diagnostics@aiims.com', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '6', name: 'Manipal PathLab', address: '987 Laboratory Lane, Science Park', phone: '123-456-7895', email: 'pathlab@manipal.com', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '7', name: 'SRL Diagnostics', address: '147 Test Center Road, Bio Valley', phone: '123-456-7896', email: 'services@srldiag.com', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '8', name: 'Dr. Lal PathLabs', address: '258 Pathology Plaza, Medical Hub', phone: '123-456-7897', email: 'info@lalpathlabs.com', created_at: '2024-01-01', updated_at: '2024-01-01' }
      ];
      setCenters(mockCenters);
    } catch (error) {
      console.error('Error fetching centers:', error);
      toast({
        title: "Error",
        description: "Failed to load diagnostic centers",
        variant: "destructive",
      });
    }
  };

  const fetchTestsByCenter = async (centerId: string) => {
    try {
      // Comprehensive mock diagnostic tests data with various categories
      const mockTests = [
        // Blood Tests
        { id: '1', name: 'Complete Blood Count (CBC)', description: 'Full blood panel with RBC, WBC, Platelets', price: 800, category: 'Blood Test', duration: '30 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '2', name: 'Lipid Profile', description: 'Cholesterol, HDL, LDL, Triglycerides', price: 1200, category: 'Blood Test', duration: '45 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '3', name: 'Thyroid Function Test (TSH, T3, T4)', description: 'Complete thyroid hormone panel', price: 1500, category: 'Blood Test', duration: '60 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '4', name: 'Liver Function Test (LFT)', description: 'SGOT, SGPT, Bilirubin, Albumin', price: 1000, category: 'Blood Test', duration: '45 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '5', name: 'Kidney Function Test (KFT)', description: 'Creatinine, Urea, Uric Acid', price: 900, category: 'Blood Test', duration: '40 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '6', name: 'Diabetes Panel (HbA1c, Glucose)', description: 'Blood sugar and long-term glucose control', price: 1100, category: 'Blood Test', duration: '35 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '7', name: 'Vitamin D Test', description: '25-OH Vitamin D levels', price: 1800, category: 'Blood Test', duration: '30 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '8', name: 'Vitamin B12 & Folate', description: 'B12 and Folate deficiency screening', price: 1600, category: 'Blood Test', duration: '30 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        
        // X-Ray Tests
        { id: '9', name: 'Chest X-Ray', description: 'Chest radiograph for lung and heart examination', price: 600, category: 'X-Ray', duration: '15 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '10', name: 'Spine X-Ray (Cervical)', description: 'Cervical spine radiograph', price: 800, category: 'X-Ray', duration: '20 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '11', name: 'Knee X-Ray (Both Knees)', description: 'Bilateral knee joint X-ray', price: 900, category: 'X-Ray', duration: '25 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '12', name: 'Pelvis X-Ray', description: 'Pelvic bone and hip joint X-ray', price: 700, category: 'X-Ray', duration: '20 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '13', name: 'Shoulder X-Ray', description: 'Shoulder joint and clavicle X-ray', price: 650, category: 'X-Ray', duration: '15 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        
        // CT Scan
        { id: '14', name: 'CT Scan - Head', description: 'Computed tomography of brain', price: 3500, category: 'CT Scan', duration: '30 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '15', name: 'CT Scan - Chest', description: 'High-resolution chest CT scan', price: 4000, category: 'CT Scan', duration: '45 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '16', name: 'CT Scan - Abdomen', description: 'Abdominal CT with contrast', price: 4500, category: 'CT Scan', duration: '60 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '17', name: 'CT Scan - Spine', description: 'Spinal CT scan (lumbar/cervical)', price: 3800, category: 'CT Scan', duration: '40 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        
        // MRI Scan
        { id: '18', name: 'MRI - Brain', description: 'Magnetic resonance imaging of brain', price: 8000, category: 'MRI Scan', duration: '90 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '19', name: 'MRI - Knee Joint', description: 'Detailed knee MRI scan', price: 7000, category: 'MRI Scan', duration: '75 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '20', name: 'MRI - Spine (Lumbar)', description: 'Lumbar spine MRI scan', price: 7500, category: 'MRI Scan', duration: '80 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '21', name: 'MRI - Cardiac', description: 'Cardiac MRI for heart evaluation', price: 12000, category: 'MRI Scan', duration: '120 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        
        // Ultrasound
        { id: '22', name: 'Ultrasound - Abdomen', description: 'Abdominal ultrasound scan', price: 1200, category: 'Ultrasound', duration: '30 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '23', name: 'Ultrasound - Pelvis', description: 'Pelvic ultrasound examination', price: 1100, category: 'Ultrasound', duration: '25 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '24', name: 'Ultrasound - Thyroid', description: 'Thyroid gland ultrasound', price: 1000, category: 'Ultrasound', duration: '20 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '25', name: 'Echocardiogram (2D Echo)', description: 'Heart ultrasound examination', price: 2500, category: 'Ultrasound', duration: '45 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        
        // Specialized Tests
        { id: '26', name: 'ECG (Electrocardiogram)', description: 'Heart rhythm and electrical activity', price: 400, category: 'Cardiology', duration: '15 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '27', name: 'Stress Test (TMT)', description: 'Treadmill test for cardiac function', price: 2000, category: 'Cardiology', duration: '60 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '28', name: 'Pulmonary Function Test (PFT)', description: 'Lung capacity and function assessment', price: 1500, category: 'Pulmonology', duration: '45 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '29', name: 'Bone Density Scan (DEXA)', description: 'Osteoporosis screening test', price: 2200, category: 'Radiology', duration: '30 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '30', name: 'Mammography', description: 'Breast cancer screening', price: 1800, category: 'Radiology', duration: '30 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        
        // Urine Tests
        { id: '31', name: 'Complete Urine Analysis', description: 'Comprehensive urine examination', price: 300, category: 'Urine Test', duration: '15 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '32', name: 'Urine Culture & Sensitivity', description: 'Bacterial infection detection', price: 600, category: 'Urine Test', duration: '24 hours', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        
        // Stool Tests
        { id: '33', name: 'Stool Analysis', description: 'Complete stool examination', price: 400, category: 'Stool Test', duration: '20 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '34', name: 'Stool Culture', description: 'Bacterial culture of stool sample', price: 800, category: 'Stool Test', duration: '48 hours', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        
        // Endoscopy
        { id: '35', name: 'Upper GI Endoscopy', description: 'Stomach and esophagus examination', price: 5000, category: 'Endoscopy', duration: '45 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '36', name: 'Colonoscopy', description: 'Large intestine examination', price: 6000, category: 'Endoscopy', duration: '60 mins', center_id: centerId, created_at: '2024-01-01', updated_at: '2024-01-01' }
      ];
      setTests(mockTests);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast({
        title: "Error",
        description: "Failed to load tests for this center",
        variant: "destructive",
      });
    }
  };

  const fetchBookedSlots = async (centerId: string, date: Date) => {
    try {
      // Mock some booked slots for demo
      const mockBookedSlots = ['10:00', '14:30'];
      setBookedSlots(mockBookedSlots);
    } catch (error) {
      console.error('Error fetching booked slots:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCenter || !selectedTest || !date || !selectedTime) {
      toast({
        title: "Error",
        description: "Please fill in all fields including time",
        variant: "destructive",
      });
      return;
    }

    // Prepare appointment details for confirmation
    const selectedCenterData = centers.find(c => c.id === selectedCenter);
    const selectedTestData = tests.find(t => t.id === selectedTest);
    
    const details = {
      center: selectedCenterData,
      test: selectedTestData,
      date: date,
      time: selectedTime,
      diagnosticCenterId: selectedCenter,
      testId: selectedTest,
      appointmentDate: date.toISOString(),
      appointmentTime: selectedTime,
      patientNotes: patientNotes,
      patientInfo: {
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        id: user?.id || ''
      }
    };
    
    setAppointmentDetails(details);
    setShowConfirmDialog(true);
  };

  const confirmAppointment = async () => {
    setLoading(true);

    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Mock successful appointment creation
      const data = {
        id: Date.now().toString(),
        patient_id: user.id,
        diagnostic_center_id: appointmentDetails.diagnosticCenterId,
        test_id: appointmentDetails.testId,
        appointment_date: format(appointmentDetails.date, 'yyyy-MM-dd'),
        appointment_time: appointmentDetails.appointmentTime,
        status: 'scheduled',
        total_amount: appointmentDetails.test?.price || 0,
        payment_status: 'pending'
      };
      
      // Store appointment in localStorage for demo
      const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
      appointments.push(data);
      localStorage.setItem('appointments', JSON.stringify(appointments));

      setShowConfirmDialog(false);
      setShowSuccessDialog(true);
      
      // Refresh booked slots
      if (selectedCenter && date) {
        fetchBookedSlots(selectedCenter, date);
      }
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render the form if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <BackButton />
          <Card>
            <CardHeader>
              <CardTitle>Book Appointment</CardTitle>
              <CardDescription>Schedule your diagnostic test appointment</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="center">Diagnostic Center</Label>
                  <Select onValueChange={setSelectedCenter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a diagnostic center" />
                    </SelectTrigger>
                    <SelectContent>
                      {centers.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name} - {center.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCenter && (
                  <div className="space-y-2">
                    <Label htmlFor="test">Diagnostic Test</Label>
                    <Select onValueChange={setSelectedTest}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a diagnostic test" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {tests.map((test) => (
                          <SelectItem key={test.id} value={test.id}>
                            <div className="flex flex-col items-start">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{test.name}</span>
                                <span className="text-primary font-semibold">₹{test.price}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {test.category} • {test.duration}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Appointment Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {date && (
                  <div className="space-y-2">
                    <Label htmlFor="time">Appointment Time</Label>
                    <Select onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem 
                            key={time} 
                            value={time}
                            disabled={bookedSlots.includes(time)}
                          >
                            <div className="flex items-center">
                              <Clock className="mr-2 h-4 w-4" />
                              {time}
                              {bookedSlots.includes(time) && (
                                <span className="ml-2 text-xs text-muted-foreground">(Booked)</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any special requirements or notes for your appointment"
                    value={patientNotes}
                    onChange={(e) => setPatientNotes(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading || !selectedTime}>
                  {loading ? "Preparing..." : "Review Appointment"}
                </Button>
              </CardContent>
            </form>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Appointment</DialogTitle>
            <DialogDescription>
              Please review your appointment details before confirming.
            </DialogDescription>
          </DialogHeader>
          
          {appointmentDetails && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="font-semibold text-sm text-muted-foreground">PATIENT INFORMATION</div>
                <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                  <div className="font-medium">{appointmentDetails.patientInfo?.name}</div>
                  <div className="text-sm text-muted-foreground">{appointmentDetails.patientInfo?.email}</div>
                  <div className="text-sm text-muted-foreground">{appointmentDetails.patientInfo?.phone}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-semibold text-sm text-muted-foreground">DIAGNOSTIC CENTER</div>
                <div className="font-medium">{appointmentDetails.center?.name}</div>
                <div className="text-sm text-muted-foreground">{appointmentDetails.center?.address}</div>
              </div>
              
              <div className="space-y-2">
                <div className="font-semibold text-sm text-muted-foreground">TEST DETAILS</div>
                <div className="font-medium">{appointmentDetails.test?.name}</div>
                <div className="text-sm text-muted-foreground">
                  Category: {appointmentDetails.test?.category}
                </div>
                <div className="text-sm text-muted-foreground">
                  Duration: {appointmentDetails.test?.duration}
                </div>
                <div className="text-lg font-semibold text-primary">
                  ₹{appointmentDetails.test?.price}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-semibold text-sm text-muted-foreground">APPOINTMENT SCHEDULE</div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span className="font-medium">
                      {appointmentDetails.date && format(appointmentDetails.date, "PPP")}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span className="font-medium">{appointmentDetails.time}</span>
                  </div>
                </div>
              </div>

              {appointmentDetails.patientNotes && (
                <div className="space-y-2">
                  <div className="font-semibold text-sm text-muted-foreground">ADDITIONAL NOTES</div>
                  <div className="bg-muted/50 p-3 rounded-lg text-sm">
                    {appointmentDetails.patientNotes}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={confirmAppointment} disabled={loading}>
              {loading ? "Confirming..." : "Confirm Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-green-600">🎉 Appointment Confirmed!</DialogTitle>
            <DialogDescription>
              Your appointment has been successfully booked. The selected time slot is now blocked for other users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-800">
                <p className="font-medium mb-2">What's next?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>You'll receive a confirmation email shortly</li>
                  <li>Arrive 15 minutes before your appointment</li>
                  <li>Bring a valid ID and any required documents</li>
                  <li>You can view your appointment in the dashboard</li>
                </ul>
              </div>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={goToDashboard} className="w-full sm:w-auto">
              View Dashboard
            </Button>
            <Button onClick={handleLogout} variant="secondary" className="w-full sm:w-auto">
              Logout & Return to Login
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookAppointment;
