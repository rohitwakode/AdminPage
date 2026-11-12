import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { DoctorContext } from "../context/DoctorContext";
import { AdminContext } from "../context/AdminContext";

const Sidebar = () => {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);

  const renderNavLink = (to, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center transition-colors duration-200 ${isActive ? "active" : ""}`
      } 
    >
      {label}
    </NavLink>
  );

  return (
    <aside className="app-sidebar">
      {aToken && !dToken && (
        <ul className="flex flex-col gap-2">
          {renderNavLink("/admin-dashboard", "Dashboard")}
          {renderNavLink("/all-appointments", "Appointments")}
          {renderNavLink("/add-doctor", "Add doctor")}
          {renderNavLink("/doctor-list", "Doctors")}
          {renderNavLink("/patient-list", "Patients")}
        </ul>
      )}

      {dToken && (
        <ul className="flex flex-col gap-2">
          {renderNavLink("/doctor-dashboard", "Dashboard")}
          {renderNavLink("/doctor-appointments", "Appointments")}
          {renderNavLink("/doctor-profile", "Profile")}
        </ul>
      )}
    </aside>
  );
};

export default Sidebar;
