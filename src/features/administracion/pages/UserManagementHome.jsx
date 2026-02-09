import React, { useEffect, useState, useContext } from "react";
import "./UserManagementHome.css";
import DynamycCard from "../../../components/DynamycCard.jsx";
import { getCantidadUsuariosConIngresos } from "../../users/services/users.service.jsx"
import Header from "../../../components/Header.jsx";
import UsersIcon from '../../../recursos/icons/Users.svg';
import UsersBIcon from '../../../recursos/icons/UsersB.svg';
import AuthContext from "../../../auth.jsx";
import { 
  getActiveUsersCount, 
  getActiveProfessorsCount, 
  getWeeklyInterviews, 
  getInterviewStatusCounts, 
  getMostRequestedSubject 
} from "../../dashboard/services/dashboard.service.jsx";

// Importa y registra todos los elementos necesarios de Chart.js
import { 
  Chart as ChartJS, 
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Doughnut, Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  LineElement, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend
);

function UserManagementHome() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalIngresoUsers, setTotalIngresoUsers] = useState(0);
  const [totalProfessores, setTotalProfessores] = useState(0);
  const [entrevistasSemanales, setEntrevistassemanales] = useState(0);
  const [loading, setLoading] = useState(true);

  const [interviewStatus, setInterviewStatus] = useState({ completadas: 0, no_realizadas: 0 });
  const [mostRequestedSubjects, setMostRequestedSubjects] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const userCount = await getActiveUsersCount();
        const professorCount = await getActiveProfessorsCount();
        const entrevistasSemanalesData = await getWeeklyInterviews();
        const interviewStatusData = await getInterviewStatusCounts();
        const subjectsData = await getMostRequestedSubject();
        const userCountIngresos = await getCantidadUsuariosConIngresos();
  
        setTotalUsers(userCount);
        setTotalIngresoUsers(userCountIngresos.cantidad); // Accede a la propiedad cantidad
        setTotalProfessores(professorCount);
        setEntrevistassemanales(entrevistasSemanalesData);
        setInterviewStatus(interviewStatusData);
        setMostRequestedSubjects(subjectsData);
      } catch (error) {
        console.error("Error al obtener los datos:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCounts();
  }, []);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const weeklyInterviews = await getWeeklyInterviews();

        
        // Verifica que los datos sean un array con 5 elementos
        if (Array.isArray(weeklyInterviews) && weeklyInterviews.length === 5) {
          setEntrevistassemanales(weeklyInterviews);
      
        } else {
          console.error("Datos inválidos recibidos:", weeklyInterviews);
          setEntrevistassemanales([0, 0, 0, 0, 0]);
        }
      } catch (error) {
        console.error("Error al obtener entrevistas semanales:", error);
        setEntrevistassemanales([0, 0, 0, 0, 0]);
      }
    };
    fetchData();
  }, []);
  
  
  if (loading) {
    return <div>Cargando...</div>;
  }

  const chartColors = {
    navy: "#1f3b57",
    teal: "#0f766e",
    gold: "#c58a0f",
    orange: "#e36414",
    slate: "#64748b",
    sky: "#0ea5e9",
    gray: "#94a3b8",
  };

  const subjectPalette = [
    chartColors.navy,
    chartColors.teal,
    chartColors.gold,
    chartColors.orange,
    chartColors.slate,
  ];

  const usuariosNoProfesores = Math.max(totalUsers - totalProfessores, 0);
  const usuariosSinIngreso = Math.max(totalUsers - totalIngresoUsers, 0);

  const completadas = interviewStatus.completadas || 0;
  const noRealizadas = interviewStatus.no_realizadas || 0;
  const totalEntrevistas = completadas + noRealizadas || 1;
  const porcentajeCompletado = ((completadas / totalEntrevistas) * 100).toFixed(1);

  const interviewStatusData = {
    labels: ["Completadas", "No realizadas"],
    datasets: [
      {
        data: [completadas, noRealizadas],
        backgroundColor: [chartColors.teal, chartColors.orange],
        hoverOffset: 8,
      },
    ],
  };

  const subjectsData = {
    labels: mostRequestedSubjects.map((item) => item.label),
    datasets: [
      {
        label: "Cantidad",
        data: mostRequestedSubjects.map((item) => item.value),
        backgroundColor: mostRequestedSubjects.map((_, index) => subjectPalette[index % subjectPalette.length]),
        borderRadius: 6,
        maxBarThickness: 42,
      },
    ],
  };

  const weeklyData = {
    labels: ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes"],
    datasets: [
      {
        label: "Entrevistas realizadas",
        data: entrevistasSemanales,
        borderColor: chartColors.navy,
        backgroundColor: "rgba(31, 59, 87, 0.08)",
        pointBackgroundColor: chartColors.gold,
        pointBorderColor: "#ffffff",
        pointRadius: 4,
        fill: true,
        tension: 0.35,
      },
    ],
  };

  const interviewsCompletionData = {
    labels: ["Completadas", "Pendientes"],
    datasets: [
      {
        label: "Porcentaje",
        data: [Number(porcentajeCompletado), 100 - Number(porcentajeCompletado)],
        backgroundColor: [chartColors.navy, chartColors.gray],
        borderRadius: 6,
        borderWidth: 0,
      },
    ],
  };

  const staffingSplitData = {
    labels: ["Profesores", "Otros usuarios"],
    datasets: [
      {
        data: [totalProfessores, usuariosNoProfesores],
        backgroundColor: [chartColors.teal, chartColors.gold],
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          padding: 12,
        },
      },
    },
    animation: {
      duration: 700,
      easing: "easeOutQuart",
    },
    responsiveAnimationDuration: 0,
  };

  const subjectsOptions = {
    maintainAspectRatio: false,
    responsive: true,
    animation: {
      duration: 700,
      easing: "easeOutQuart",
    },
    responsiveAnimationDuration: 0,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f1f15",
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#1e7e34" },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(79, 70, 229, 0.08)",
        },
        ticks: { stepSize: 1, color: "#0f172a" },
      },
    },
  };

  const lineOptions = {
    maintainAspectRatio: false,
    responsive: true,
    animation: {
      duration: 700,
      easing: "easeOutQuart",
    },
    responsiveAnimationDuration: 0,
    plugins: {
      legend: { display: false },
      tooltip: {
        intersect: false,
        backgroundColor: "#0f1f15",
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#0f172a" },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(148, 163, 184, 0.3)",
        },
        ticks: { color: "#0f172a" },
      },
    },
  };

  const staffingOptions = {
    maintainAspectRatio: false,
    responsive: true,
    animation: {
      duration: 700,
      easing: "easeOutQuart",
    },
    responsiveAnimationDuration: 0,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          padding: 10,
        },
      },
    },
  };
  

  
  
  

  const displayName = (() => {
    if (!user) return "";
    const parts = [
      user.nombres || user.Nombres || user.nombre || "",
      user.apellidopaterno || user.ApellidoPaterno || "",
      user.apellidomaterno || user.ApellidoMaterno || ""
    ]
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    return parts;
  })();

  return (
    <>
      <section className="container-UserManagemet-Home">
        <section className="dashboard-header">
          <Header
            title={"DASHBOARD ADMINISTRADTIVO"}
            subtitle={`BIENVENIDO AL SISTEMA IDEB${displayName ? ` ${displayName.toUpperCase()}` : ""}`}
          />
        </section>

        <section className="Card-Dinamc-Container stats-strip">
          <DynamycCard
            NumberUsers={totalUsers}
            icon={UsersIcon}
            nameTitle={"Total de Usuarios"}
            route="/listar"
          />
          <DynamycCard
            NumberUsers={totalIngresoUsers}
            icon={UsersIcon}
            nameTitle={"Total de Usuarios Ingresados"}
            route="/ingresos"
          />
          <DynamycCard
            NumberUsers={totalProfessores}
            icon={UsersBIcon}
            nameTitle={"Total Profesores"}
            route="/listar"
          />
         
          <DynamycCard
            NumberUsers={completadas}
            icon={UsersIcon}
            nameTitle={"Entrevistas completadas"}
            route="/listaEntrevistas"
          />
        </section>

        <section className="charts-section">
          <div className="charts-row">
            <div className="chart-container chart-container--subjects">
              <h3>Materias mas demandadas</h3>
              <Bar data={subjectsData} options={subjectsOptions} />
            </div>

            <div className="chart-container chart-container--compact chart-container--status">
              <h3>Estado de entrevistas</h3>
              <Doughnut data={interviewStatusData} options={doughnutOptions} />
            </div>

            <div className="chart-container chart-container--wide chart-container--weekly">
              <h3>Entrevistas semanales</h3>
              <Line data={weeklyData} options={lineOptions} />
            </div>

            <div className="chart-container chart-container--compact chart-container--completion">
              <h3>Tasa de entrevistas completadas</h3>
              <Bar data={interviewsCompletionData} options={subjectsOptions} />
            </div>

            <div className="chart-container chart-container--compact chart-container--roles">
              <h3>Distribucion de roles</h3>
              <Pie data={staffingSplitData} options={staffingOptions} />
            </div>
          </div>
        </section>

      </section>
    </>
  );
}

export default UserManagementHome;




