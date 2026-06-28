import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../pages/auth/LoginScreen';
import MainLayout from '../components/layout/MainLayout';
import DashboardScreen from '../pages/dashboard/DashboardScreen';
import EnfermeriaScreen from '../pages/enfermeria/EnfermeriaScreen';
import PatientDetailScreen from '../pages/enfermeria/PatientDetailScreen';
import EnfermeriaVitalSignsScreen from '../pages/enfermeria/EnfermeriaVitalSignsScreen';
import EnfermeriaNoteScreen from '../pages/enfermeria/EnfermeriaNoteScreen';
import EnfermeriaMedicationsScreen from '../pages/enfermeria/EnfermeriaMedicationsScreen';
import MedicoScreen from '../pages/medico/MedicoScreen';
import MedicoPatientDetailScreen from '../pages/medico/PatientDetailScreen';
import VitalSignsScreen from '../pages/medico/VitalSignsScreen';
import MedicalNoteScreen from '../pages/medico/MedicalNoteScreen';
import DiagnosisScreen from '../pages/medico/DiagnosisScreen';
import HistoriaClinicaScreen from '../pages/medico/HistoriaClinicaScreen';
import PrescriptionScreen from '../pages/medico/PrescriptionScreen';
import LabExamsScreen from '../pages/medico/LabExamsScreen';
import ImagingExamsScreen from '../pages/medico/ImagingExamsScreen';
import PrintDocsScreen from '../pages/medico/PrintDocsScreen';
import StudyResultsScreen from '../pages/medico/StudyResultsScreen';
import VitalSignsListScreen from '../pages/medico/VitalSignsListScreen';

// Placeholder - irás reemplazando con los componentes reales
const Placeholder = ({ name }) => (
  <div style={{ padding: 32, fontSize: 24 }}>{name} — en construcción</div>
);

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-screen">Cargando...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const PublicLoginRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="loading-screen">Cargando...</div>;

  return isAuthenticated ? <Navigate to="/" replace /> : <LoginScreen />;
};

export default function AppRouter() {
  const { user } = useAuth();
  const role = user?.role;

  const isAdmin   = role === 'admin';
  const isAdminOrAdministrativo = isAdmin || role === 'administrativo';
  const isMedico  = role === 'medico';
  const isEnfermeria = role === 'enfermero' || role === 'enfermeria';
  const isEstudios = role === 'estudios';

  return (
    <Routes>
      <Route path="/login" element={<PublicLoginRoute />} />

      <Route
        path="/*"
        element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                {/* Dashboard */}
                <Route path="/" element={<DashboardScreen />} />

                {/* Admin / Administrativo */}
                {isAdminOrAdministrativo && <>
                  <Route path="/admin"           element={<Placeholder name="Admin" />} />
                  <Route path="/pacientes"        element={<Placeholder name="Pacientes" />} />
                  <Route path="/pacientes/:id"    element={<Placeholder name="Detalle Paciente" />} />
                  <Route path="/nuevo-paciente"   element={<Placeholder name="Nuevo Paciente" />} />
                  <Route path="/censo"            element={<Placeholder name="Censo" />} />
                  <Route path="/corte-caja"       element={<Placeholder name="Corte Caja" />} />
                  <Route path="/camas"            element={<Placeholder name="Camas" />} />
                </>}

                {/* Médico */}
                {(isAdmin || isMedico) && <>
                  <Route path="/medico"                    element={<MedicoScreen />} />
                  <Route path="/medico/paciente/:id"       element={<MedicoPatientDetailScreen />} />
                  <Route path="/medico/paciente/:idAtencion/:idExp" element={<MedicoPatientDetailScreen />} />
                  <Route path="/medico/historia-clinica"   element={<HistoriaClinicaScreen />} />
                  <Route path="/medico/signos-vitales"     element={<VitalSignsScreen />} />
                  <Route path="/medico/signos-vitales/historial" element={<VitalSignsListScreen />} />
                  <Route path="/medico/nota-medica"        element={<MedicalNoteScreen />} />
                  <Route path="/medico/diagnostico"        element={<DiagnosisScreen />} />
                  <Route path="/medico/receta"             element={<PrescriptionScreen />} />
                  <Route path="/medico/lab-exams"          element={<LabExamsScreen />} />
                  <Route path="/medico/imaging-exams"      element={<ImagingExamsScreen />} />
                  <Route path="/medico/imprimir"           element={<PrintDocsScreen />} />
                  <Route path="/medico/resultados"         element={<StudyResultsScreen />} />
                </>}

                {/* Enfermería */}
                {(isAdmin || isEnfermeria) && <>
                  <Route path="/enfermeria"                  element={<EnfermeriaScreen />} />
                  <Route path="/enfermeria/paciente/:id"     element={<PatientDetailScreen />} />
                  <Route path="/enfermeria/paciente/:idAtencion/:idExp" element={<PatientDetailScreen />} />
                  <Route path="/enfermeria/signos-vitales"   element={<EnfermeriaVitalSignsScreen />} />
                  <Route path="/enfermeria/nota"             element={<EnfermeriaNoteScreen />} />
                  <Route path="/enfermeria/medicamentos"     element={<EnfermeriaMedicationsScreen />} />
                </>}

                {/* Estudios */}
                {(isAdmin || isMedico || isEstudios) && <>
                  <Route path="/estudios"                    element={<Placeholder name="Panel Estudios" />} />
                  <Route path="/estudios/subir-resultado"    element={<Placeholder name="Subir Resultado" />} />
                  <Route path="/estudios/ver-lab"            element={<Placeholder name="Ver Resultado Lab" />} />
                  <Route path="/estudios/ver-gab"            element={<Placeholder name="Ver Resultado Gab" />} />
                  <Route path="/estudios/editar-lab"         element={<Placeholder name="Editar Lab" />} />
                  <Route path="/estudios/editar-gab"         element={<Placeholder name="Editar Gab" />} />
                </>}

                {/* Config — solo admin */}
                {isAdmin && <>
                  <Route path="/config"                element={<Placeholder name="Configuración" />} />
                  <Route path="/config/general"        element={<Placeholder name="Config General" />} />
                  <Route path="/config/usuarios"       element={<Placeholder name="Config Usuarios" />} />
                  <Route path="/config/camas"          element={<Placeholder name="Config Camas" />} />
                  <Route path="/config/servicios"      element={<Placeholder name="Config Servicios" />} />
                  <Route path="/config/automatizacion" element={<Placeholder name="Config Automatización" />} />
                  <Route path="/config/backup"         element={<Placeholder name="Config Backup" />} />
                  <Route path="/config/perfil"         element={<Placeholder name="Config Perfil" />} />
                </>}

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}