
                    const API_URL = "http://localhost:5000";

                    // APP STATE
                    let currentUser = null; // { role: 'GUEST' | 'CUSTOMER' | 'OWNER', id, name, email }
                    let allVehicles = [];
                    let allCategories = [];
                    let allBranches = [];
                    let selectedVehicleForPay = null;
                    let isAuthRegister = false;
                    let activeAuthRole = "CUSTOMER";

                    // INITIALIZATION
                    document.addEventListener("DOMContentLoaded", () => {
                        loadDropdownData();
                        loadVehicles();
                        updateRoleUI();

                        // Default dates in payment modal
                        const today = new Date().toISOString().split('T')[0];
                        document.getElementById("payStartDate").value = today;

                        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                        document.getElementById("payEndDate").value = tomorrow;
                    });

                    // NAVIGATION TABS
                    function switchTab(tabId) {
                        document.querySelectorAll(".tab-pane").forEach(el => el.classList.remove("active"));
                        document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));

                        const targetPane = document.getElementById(tabId);
                        if (targetPane) targetPane.classList.add("active");

                        // Hide hero stats (vehicles and branches count) on Contact and Help tabs
                        const heroStatsBox = document.querySelector(".hero-stats");
                        if (heroStatsBox) {
                            if (tabId === 'contactTab' || tabId === 'helpTab') {
                                heroStatsBox.style.display = "none";
                            } else {
                                heroStatsBox.style.display = "flex";
                            }
                        }

                        // Highlight nav item
                        const activeNav = Array.from(document.querySelectorAll(".nav-item")).find(el => {
                            const attr = el.getAttribute("onclick");
                            return attr && attr.includes(tabId);
                        });
                        if (activeNav) activeNav.classList.add("active");

                        // Auto-fetch data for the active tab
                        if (tabId === 'browseTab') loadVehicles();
                        if (tabId === 'fleetTab') loadVehicles();
                        if (tabId === 'bookingsTab') loadBookings();
                        if (tabId === 'maintenanceTab') loadMaintenance();
                        if (tabId === 'addVehicleTab') loadDropdownData();
                        if (tabId === 'adminTab') loadAdminPanel();
                    }

                    // ROLE ACCESS UI UPDATES
                    function updateRoleUI() {
                        const roleBadge = document.getElementById("roleBadge");
                        const authBtnText = document.getElementById("authBtnText");
                        const modulePill = document.getElementById("modulePill");
                        const heroHeading = document.getElementById("heroHeading");
                        const heroSubheading = document.getElementById("heroSubheading");

                        const customerNavs = document.querySelectorAll(".role-customer-only");
                        const ownerNavs = document.querySelectorAll(".role-owner-only");
                        const adminNavs = document.querySelectorAll(".role-admin-only");

                        const ownerDisplay = document.getElementById("ownerNameDisplay");
                        const ownerSel = document.getElementById("ownerSelect");

                        const bookingsTabNav = document.getElementById("navBookingsTab");
                        const bookingsTitle = document.getElementById("bookingsTabTitle");
                        const bookingsSub = document.getElementById("bookingsTabSubtitle");

                        if (!currentUser || currentUser.role === "GUEST") {
                            roleBadge.className = "role-badge guest";
                            roleBadge.innerHTML = `<i class="fa-solid fa-user-slash"></i> Guest Mode`;
                            authBtnText.innerText = "Sign In";
                            customerNavs.forEach(el => el.style.display = "none");
                            ownerNavs.forEach(el => el.style.display = "none");
                            adminNavs.forEach(el => el.style.display = "none");
                            if (bookingsTabNav) bookingsTabNav.style.display = "none";
                            if (modulePill) modulePill.innerHTML = `<i class="fa-solid fa-compass"></i> Public Rental Portal`;
                            if (heroHeading) heroHeading.innerText = "Premium Vehicle Rental & Fleet Management";
                            if (heroSubheading) heroSubheading.innerText = "Rent luxury cars, bikes, and SUVs seamlessly, or explore top-rated rental vehicles across multiple cities.";

                            if (ownerDisplay && ownerSel) {
                                ownerDisplay.style.display = "none";
                                ownerSel.style.display = "block";
                                ownerSel.setAttribute("required", "required");
                            }
                        } else if (currentUser.role === "CUSTOMER") {
                            roleBadge.className = "role-badge customer";
                            roleBadge.innerHTML = `<i class="fa-solid fa-user-check"></i> Customer: ${currentUser.name}`;
                            authBtnText.innerText = "Sign Out";
                            customerNavs.forEach(el => el.style.display = "flex");
                            ownerNavs.forEach(el => el.style.display = "none");
                            adminNavs.forEach(el => el.style.display = "none");
                            if (bookingsTabNav) {
                                bookingsTabNav.style.display = "flex";
                                bookingsTabNav.innerHTML = `<i class="fa-solid fa-receipt"></i> My Bookings & Receipts`;
                            }
                            if (bookingsTitle) bookingsTitle.innerHTML = `<i class="fa-solid fa-receipt" style="color: var(--primary-blue);"></i> My Rental History & Receipts`;
                            if (bookingsSub) bookingsSub.innerText = `View all your confirmed rentals and download official payment receipts.`;

                            if (modulePill) modulePill.innerHTML = `<i class="fa-solid fa-user-check"></i> Customer Rental Module`;
                            if (heroHeading) heroHeading.innerText = `Welcome Back, ${currentUser.name}!`;
                            if (heroSubheading) heroSubheading.innerText = "Browse premium cars, bikes, and SUVs, book your rentals, and track your active bookings in real-time.";

                            if (ownerDisplay && ownerSel) {
                                ownerDisplay.style.display = "none";
                                ownerSel.style.display = "block";
                                ownerSel.setAttribute("required", "required");
                            }
                        } else if (currentUser.role === "OWNER") {
                            roleBadge.className = "role-badge owner";
                            roleBadge.innerHTML = `<i class="fa-solid fa-user-gear"></i> Owner: ${currentUser.name}`;
                            authBtnText.innerText = "Sign Out";
                            customerNavs.forEach(el => el.style.display = "none");
                            ownerNavs.forEach(el => el.style.display = "flex");
                            adminNavs.forEach(el => el.style.display = "none");
                            if (bookingsTabNav) {
                                bookingsTabNav.style.display = "flex";
                                bookingsTabNav.innerHTML = `<i class="fa-solid fa-receipt"></i> Fleet Rental History`;
                            }
                            if (bookingsTitle) bookingsTitle.innerHTML = `<i class="fa-solid fa-receipt" style="color: var(--primary-blue);"></i> Fleet Rental & Payment History`;
                            if (bookingsSub) bookingsSub.innerText = `View all rental bookings and payment receipts for vehicles registered under your account.`;

                            if (modulePill) modulePill.innerHTML = `<i class="fa-solid fa-user-gear"></i> Vehicle Owner Management Module`;
                            if (heroHeading) heroHeading.innerText = `Vehicle Owner Portal — ${currentUser.name}`;
                            if (heroSubheading) heroSubheading.innerText = "Manage your operating branches, register new vehicles to your fleet, and monitor maintenance tracking.";

                            if (ownerDisplay && ownerSel) {
                                ownerDisplay.style.display = "block";
                                ownerDisplay.value = `${currentUser.name} (Owner #${currentUser.id})`;
                                ownerSel.style.display = "none";
                                ownerSel.removeAttribute("required");
                            }
                            const ownerBranchesCard = document.getElementById("ownerBranchesCard");
                            if (ownerBranchesCard) ownerBranchesCard.style.display = "block";

                            const fleetSubtitle = document.getElementById("fleetSubtitle");
                            if (fleetSubtitle) fleetSubtitle.innerText = `Showing vehicles owned by ${currentUser.name} (Owner #${currentUser.id})`;

                            updateOwnerStats();
                            loadOwnerBranches();
                            loadDropdownData();
                        } else if (currentUser.role === "ADMIN") {
                            roleBadge.className = "role-badge admin";
                            roleBadge.innerHTML = `<i class="fa-solid fa-crown"></i> Admin: ${currentUser.name}`;
                            authBtnText.innerText = "Sign Out";
                            customerNavs.forEach(el => el.style.display = "none");
                            ownerNavs.forEach(el => el.style.display = "none");
                            adminNavs.forEach(el => el.style.display = "flex");
                            if (bookingsTabNav) {
                                bookingsTabNav.style.display = "flex";
                                bookingsTabNav.innerHTML = `<i class="fa-solid fa-receipt"></i> All Payment History`;
                            }
                            if (bookingsTitle) bookingsTitle.innerHTML = `<i class="fa-solid fa-receipt" style="color: var(--primary-blue);"></i> All System Payment & Rental History`;
                            if (bookingsSub) bookingsSub.innerText = `Super admin overview of all customer bookings, transactions, and payment receipts across the system.`;

                            if (modulePill) modulePill.innerHTML = `<i class="fa-solid fa-crown"></i> Super Admin Governance Module`;
                            if (heroHeading) heroHeading.innerText = `Super Admin Control Panel — ${currentUser.name}`;
                            if (heroSubheading) heroSubheading.innerText = `Hi Boss, welcome! Let's supervise Velocity Rentals, monitor fleet activity, and manage system operations.`;

                            if (ownerDisplay && ownerSel) {
                                ownerDisplay.style.display = "none";
                                ownerSel.style.display = "block";
                            }
                            const ownerBranchesCard = document.getElementById("ownerBranchesCard");
                            if (ownerBranchesCard) ownerBranchesCard.style.display = "none";
                            loadDropdownData();
                        }

                        // Status filter control
                        const statusFilterGroup = document.getElementById("statusFilterGroup");
                        if (statusFilterGroup) {
                            statusFilterGroup.style.display = "block";
                            const filterStatus = document.getElementById("filterStatus");
                            if (filterStatus && !currentUser) filterStatus.value = "";
                        }
                        applyVehicleFilters();
                    }

                    // FETCH OWNER SPECIFIC STATS
                    async function updateOwnerStats() {
                        if (!currentUser || currentUser.role !== "OWNER") return;
                        try {
                            const res = await fetch(`${API_URL}/owners/${currentUser.id}/stats`);
                            if (res.ok) {
                                const stats = await res.json();
                                document.getElementById("statVehiclesCount").innerText = stats.total_vehicles || 0;
                                document.getElementById("statBranchesCount").innerText = stats.total_branches || 0;
                            }
                        } catch (err) {
                            console.warn("Owner stats fetch notice:", err);
                        }
                    }

                    // FETCH OWNER OPERATING BRANCHES
                    async function loadOwnerBranches() {
                        if (!currentUser || currentUser.role !== "OWNER") return;
                        const grid = document.getElementById("ownerBranchesGrid");
                        if (!grid) return;
                        try {
                            const res = await fetch(`${API_URL}/owners/${currentUser.id}/branches`);
                            if (!res.ok) throw new Error("Failed to load owner branches");
                            const branches = await res.json();

                            if (branches.length === 0) {
                                grid.innerHTML = `<div style="color: var(--text-muted); grid-column: 1/-1; padding: 10px;">No operating branches found yet. Click <strong>+ Add New Branch</strong> to create your first branch.</div>`;
                                return;
                            }

                            grid.innerHTML = "";
                            branches.forEach(b => {
                                const isCreatedByMe = b.CREATED_BY_OWNER_ID == currentUser.id;
                                const card = document.createElement("div");
                                card.className = "contact-info-card";
                                card.style.textAlign = "left";
                                card.style.background = "#ffffff";
                                card.style.border = "1px solid var(--border-subtle)";
                                card.style.padding = "16px";

                                card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                            <div style="font-weight: 700; color: var(--text-bright); font-size: 15px;">
                                <i class="fa-solid fa-building" style="color: var(--primary-blue); margin-right: 6px;"></i> ${b.BRANCH_NAME}
                            </div>
                            ${isCreatedByMe ? `<span style="background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 700;">Created by You</span>` : `<span style="background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: 600;">System Branch</span>`}
                        </div>
                        <div style="font-size: 13px; color: var(--text-main); margin-bottom: 4px;">📍 <strong>${b.CITY}</strong> ${b.LOCATION_AREA ? ' - ' + b.LOCATION_AREA : ''}</div>
                        ${b.PHONE ? `<div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;"><i class="fa-solid fa-phone"></i> ${b.PHONE}</div>` : ''}
                        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--border-subtle); display: flex; justify-content: space-between; align-items: center; font-size: 12px;">
                            <span style="color: var(--text-muted);">Vehicles Owned Here:</span>
                            <span style="font-weight: 800; color: var(--primary-blue); font-size: 14px;">${b.VEHICLE_COUNT || 0}</span>
                        </div>
                    `;
                                grid.appendChild(card);
                            });
                        } catch (err) {
                            grid.innerHTML = `<div style="color: #dc2626; grid-column: 1/-1;">Error loading branches: ${err.message}</div>`;
                        }
                    }

                    // BRANCH MODAL LOGIC
                    function openBranchModal() {
                        document.getElementById("branchModal").classList.add("active");
                    }

                    function closeBranchModal() {
                        document.getElementById("branchModal").classList.remove("active");
                    }

                    async function handleBranchSubmit(e) {
                        e.preventDefault();
                        const msg = document.getElementById("branchMsg");
                        msg.style.display = "none";

                        const payload = {
                            branch_name: document.getElementById("branchNameInput").value.trim(),
                            city: document.getElementById("branchCityInput").value.trim(),
                            location_area: document.getElementById("branchAreaInput").value.trim(),
                            phone: document.getElementById("branchPhoneInput").value.trim(),
                            owner_id: currentUser && currentUser.role === "OWNER" ? currentUser.id : null
                        };

                        try {
                            const res = await fetch(`${API_URL}/branches`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload)
                            });
                            const data = await res.json();
                            if (!res.ok) throw new Error(data.message || "Failed to add branch");

                            const createdBranchId = data.branch ? data.branch.branch_id : null;

                            msg.style.display = "block";
                            msg.style.color = "#059669";
                            msg.innerText = `Branch "${data.branch.branch_name}" added successfully!`;
                            document.getElementById("branchForm").reset();

                            setTimeout(async () => {
                                closeBranchModal();
                                await loadDropdownData();
                                if (createdBranchId) {
                                    const bSel = document.getElementById("branchSelect");
                                    if (bSel) bSel.value = createdBranchId;
                                }
                                loadVehicles();
                                if (currentUser && currentUser.role === "OWNER") {
                                    updateOwnerStats();
                                    loadOwnerBranches();
                                }
                            }, 1200);
                        } catch (err) {
                            msg.style.display = "block";
                            msg.style.color = "#dc2626";
                            msg.innerText = err.message;
                        }
                    }

                    // FETCH DROPDOWN DATA
                    async function loadDropdownData() {
                        try {
                            const [catRes, branchRes, ownerRes] = await Promise.all([
                                fetch(`${API_URL}/categories`),
                                fetch(`${API_URL}/branches`),
                                fetch(`${API_URL}/owners`)
                            ]);

                            if (catRes.ok) {
                                allCategories = await catRes.json();
                                const filterCat = document.getElementById("filterCategory");
                                const catSel = document.getElementById("categorySelect");

                                filterCat.innerHTML = '<option value="">All Categories</option>';
                                catSel.innerHTML = '<option value="">Select Category</option>';

                                allCategories.forEach(c => {
                                    filterCat.innerHTML += `<option value="${c.CATEGORY_ID}">${c.CATEGORY_NAME}</option>`;
                                    catSel.innerHTML += `<option value="${c.CATEGORY_ID}">${c.CATEGORY_NAME}</option>`;
                                });
                            }

                            if (branchRes.ok) {
                                allBranches = await branchRes.json();
                                const filterBranch = document.getElementById("filterCategory") ? document.getElementById("filterBranch") : document.getElementById("filterBranch");
                                const branchSel = document.getElementById("branchSelect");

                                filterBranch.innerHTML = '<option value="">All Branch Cities & Areas</option>';
                                branchSel.innerHTML = '<option value="">Select Branch Location</option>';

                                if (!currentUser || currentUser.role !== "OWNER") {
                                    document.getElementById("statBranchesCount").innerText = allBranches.length;
                                }

                                // Populate Browse filter dropdown with all branches
                                allBranches.forEach(b => {
                                    const areaText = b.LOCATION_AREA ? ` (${b.LOCATION_AREA})` : '';
                                    filterBranch.innerHTML += `<option value="${b.BRANCH_ID}">${b.CITY} - ${b.BRANCH_NAME}${areaText}</option>`;
                                });

                                // Populate Add Vehicle branch select strictly for Owner role
                                let targetBranches = allBranches;
                                if (currentUser && currentUser.role === "OWNER") {
                                    let ownerBranchesList = [];
                                    try {
                                        const obRes = await fetch(`${API_URL}/owners/${currentUser.id}/branches`);
                                        if (obRes.ok) ownerBranchesList = await obRes.json();
                                    } catch (e) { }

                                    targetBranches = allBranches.filter(b =>
                                        b.CREATED_BY_OWNER_ID == currentUser.id ||
                                        ownerBranchesList.some(ob => ob.BRANCH_ID == b.BRANCH_ID)
                                    );
                                }

                                if (currentUser && currentUser.role === "OWNER" && targetBranches.length === 0) {
                                    branchSel.innerHTML = '<option value="">No branches created for your account yet. Click "+ Add Branch" button</option>';
                                } else {
                                    targetBranches.forEach(b => {
                                        const areaText = b.LOCATION_AREA ? ` (${b.LOCATION_AREA})` : '';
                                        branchSel.innerHTML += `<option value="${b.BRANCH_ID}">${b.BRANCH_NAME} [${b.CITY}${areaText}]</option>`;
                                    });
                                }
                            }

                            if (ownerRes.ok) {
                                const owners = await ownerRes.json();
                                const ownerSel = document.getElementById("ownerSelect");
                                ownerSel.innerHTML = '<option value="">Select Owner</option>';
                                owners.forEach(o => {
                                    ownerSel.innerHTML += `<option value="${o.OWNER_ID}">${o.OWNER_NAME}</option>`;
                                });
                            }
                        } catch (err) {
                            console.warn("Backend dropdown fetch notice:", err);
                        }
                    }

                    // LOAD VEHICLES
                    async function loadVehicles() {
                        try {
                            const isOwner = currentUser && currentUser.role === "OWNER";
                            const url = isOwner ? `${API_URL}/vehicles?owner_id=${currentUser.id}` : `${API_URL}/vehicles`;

                            const res = await fetch(url);
                            if (!res.ok) throw new Error("Failed to load vehicles from server");
                            const fetchedVehicles = await res.json();

                            if (!isOwner) {
                                allVehicles = fetchedVehicles;
                                const statEl = document.getElementById("statVehiclesCount");
                                if (statEl) statEl.innerText = allVehicles.length;
                            } else {
                                const allRes = await fetch(`${API_URL}/vehicles`);
                                if (allRes.ok) allVehicles = await allRes.json();
                                updateOwnerStats();
                                loadOwnerBranches();
                            }

                            applyVehicleFilters();
                            renderFleetTable(isOwner ? fetchedVehicles : allVehicles);
                            populateMaintenanceVehicleSelect(isOwner ? fetchedVehicles : allVehicles);
                        } catch (err) {
                            const grid = document.getElementById("vehicleGrid");
                            if (grid) {
                                grid.innerHTML = `
                                    <div style="color: #dc2626; padding: 20px; font-weight: 600; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px;">
                                        <i class="fa-solid fa-triangle-exclamation"></i> Cannot connect to backend API server at <code>${API_URL}</code>.<br>
                                        <small style="color: #7f1d1d;">Please ensure the node server is running on port 5000 (run <code>cd backend && node app.js</code> in your terminal).</small>
                                    </div>
                                `;
                            }
                        }
                    }

                    // RENDER VEHICLE GRID (BROWSE TAB)
                    function renderVehicleGrid(vehicles) {
                        const grid = document.getElementById("vehicleGrid");
                        grid.innerHTML = "";

                        if (vehicles.length === 0) {
                            grid.innerHTML = `<div style="color: var(--text-muted); padding: 20px;">No matching vehicles found.</div>`;
                            return;
                        }

                        vehicles.forEach(v => {
                            const card = document.createElement("div");
                            card.className = "vehicle-card";

                            const iconClass = v.CATEGORY_NAME && v.CATEGORY_NAME.toLowerCase().includes("bike") ? "fa-motorcycle" : "fa-car";
                            const isAvailable = v.STATUS === "AVAILABLE";
                            const locationDisplay = [v.CITY, v.LOCATION_AREA].filter(Boolean).join(" - ");

                            card.innerHTML = `
                    <div class="vehicle-card-img">
                        <i class="fa-solid ${iconClass}" style="color: var(--primary-blue);"></i>
                        <span class="status-badge status-${v.STATUS}">${v.STATUS}</span>
                    </div>
                    <div class="vehicle-card-body">
                        <div class="vehicle-title">${v.REGISTRATION_NO || 'Vehicle #' + v.VEHICLE_ID}</div>
                        <div class="vehicle-sub">${v.CATEGORY_NAME || 'Standard'} • ID #${v.VEHICLE_ID}</div>

                        <div class="vehicle-specs">
                            <div class="spec-row"><span class="spec-label">Location / Area:</span> <span style="font-weight:700; color:var(--primary-blue);">📍 ${locationDisplay || v.CITY || 'Main Hub'} ${v.BRANCH_NAME ? '(' + v.BRANCH_NAME + ')' : ''}</span></div>
                            <div class="spec-row"><span class="spec-label">Owner:</span> <span>${v.OWNER_NAME || 'Velocity Fleet'} ${v.OWNER_PHONE ? '<br><small style="color:var(--primary-blue); font-weight:700;"><i class="fa-solid fa-phone"></i> ' + v.OWNER_PHONE + '</small>' : ''}</span></div>
                        </div>

                        <div class="price-tag">₹1,500 <span>/ day</span></div>

                        <div class="vehicle-card-actions">
                            ${isAvailable ? `
                                <button class="btn btn-primary" style="width:100%;" onclick="openPaymentModal(${v.VEHICLE_ID})">
                                    <i class="fa-solid fa-key"></i> Rent Now
                                </button>
                            ` : `
                                <button class="btn btn-secondary" style="width:100%;" disabled>
                                    ${v.STATUS}
                                </button>
                            `}
                        </div>
                    </div>
                `;
                            grid.appendChild(card);
                        });
                    }

                    // RENDER FLEET TABLE (OWNER & ADMIN TABS)
                    function renderFleetTable(vehicles) {
                        const tbody = document.getElementById("fleetTableBody");
                        tbody.innerHTML = "";

                        let fleetList = vehicles;
                        if (currentUser && currentUser.role === "OWNER") {
                            fleetList = vehicles.filter(v => v.OWNER_ID === currentUser.id);
                        }

                        if (fleetList.length === 0) {
                            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 20px;">No vehicles found in your fleet. Click "Add Vehicle" tab to register one.</td></tr>`;
                            return;
                        }

                        fleetList.forEach(v => {
                            const isMine = currentUser && currentUser.role === "OWNER" && v.OWNER_ID === currentUser.id;
                            const locText = [v.CITY, v.LOCATION_AREA].filter(Boolean).join(" - ");
                            const row = document.createElement("tr");
                            row.innerHTML = `
                    <td><strong>#${v.VEHICLE_ID}</strong></td>
                    <td>${v.REGISTRATION_NO}</td>
                    <td>${v.CATEGORY_NAME || 'N/A'}</td>
                    <td>${v.BRANCH_NAME || 'N/A'} <br><small style="color:var(--text-muted); font-size:11px;">📍 ${locText || 'N/A'}</small></td>
                    <td>${v.OWNER_NAME || 'N/A'} ${isMine ? '<span style="background:#eff6ff; color:var(--primary-blue); border:1px solid var(--border-blue); border-radius:10px; font-size:10px; padding:2px 6px; font-weight:700; margin-left:4px;">You</span>' : ''}</td>
                    <td><span class="status-badge status-${v.STATUS}">${v.STATUS}</span></td>
                    <td>
                        <div style="display:flex; gap:6px;">
                            <select onchange="updateVehicleStatus(${v.VEHICLE_ID}, this.value)" style="padding:4px 8px; font-size:12px; background:#ffffff; color:#0f172a; border:1px solid #cbd5e1; border-radius:6px;">
                                <option value="">Change Status</option>
                                <option value="AVAILABLE" ${v.STATUS === 'AVAILABLE' ? 'selected' : ''}>AVAILABLE</option>
                                <option value="BOOKED" ${v.STATUS === 'BOOKED' ? 'selected' : ''}>BOOKED</option>
                                <option value="RENTED" ${v.STATUS === 'RENTED' ? 'selected' : ''}>RENTED</option>
                                <option value="MAINTENANCE" ${v.STATUS === 'MAINTENANCE' ? 'selected' : ''}>MAINTENANCE</option>
                            </select>
                            <button class="btn btn-danger" style="padding:4px 10px; font-size:12px;" onclick="deleteVehicle(${v.VEHICLE_ID})">Delete</button>
                        </div>
                    </td>
                `;
                            tbody.appendChild(row);
                        });
                    }

                    // FILTER VEHICLES
                    function applyVehicleFilters() {
                        const catEl = document.getElementById("filterCategory");
                        const branchEl = document.getElementById("filterBranch");
                        const statusEl = document.getElementById("filterStatus");
                        const searchEl = document.getElementById("searchKeyword");

                        const cat = catEl ? catEl.value : "";
                        const branch = branchEl ? branchEl.value : "";
                        const status = statusEl ? statusEl.value : "";
                        const keyword = searchEl ? searchEl.value.toLowerCase().trim() : "";

                        const filtered = allVehicles.filter(v => {
                            const matchCat = !cat || v.CATEGORY_ID == cat;
                            const matchBranch = !branch || v.BRANCH_ID == branch;
                            const matchStatus = !status || v.STATUS == status;
                            const matchKw = !keyword ||
                                (v.REGISTRATION_NO && v.REGISTRATION_NO.toLowerCase().includes(keyword)) ||
                                (v.CITY && v.CITY.toLowerCase().includes(keyword)) ||
                                (v.LOCATION_AREA && v.LOCATION_AREA.toLowerCase().includes(keyword)) ||
                                (v.BRANCH_NAME && v.BRANCH_NAME.toLowerCase().includes(keyword)) ||
                                (v.CATEGORY_NAME && v.CATEGORY_NAME.toLowerCase().includes(keyword)) ||
                                (v.OWNER_NAME && v.OWNER_NAME.toLowerCase().includes(keyword)) ||
                                v.VEHICLE_ID.toString().includes(keyword);

                            return matchCat && matchBranch && matchStatus && matchKw;
                        });

                        renderVehicleGrid(filtered);
                    }

                    // ADD VEHICLE SUBMIT
                    document.getElementById("addVehicleForm").addEventListener("submit", async (e) => {
                        e.preventDefault();
                        const msg = document.getElementById("addVehicleMsg");
                        msg.style.display = "none";

                        const ownerId = (currentUser && currentUser.role === "OWNER") ?
                            currentUser.id :
                            (parseInt(document.getElementById("ownerSelect").value) || 1);

                        const data = {
                            registration_no: document.getElementById("regNumberInput").value.trim().toUpperCase(),
                            category_id: parseInt(document.getElementById("categorySelect").value),
                            branch_id: parseInt(document.getElementById("branchSelect").value),
                            owner_id: ownerId,
                            status: document.getElementById("statusSelect").value
                        };

                        try {
                            const res = await fetch(`${API_URL}/vehicles`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(data)
                            });
                            const result = await res.json();

                            if (!res.ok) throw new Error(result.message || "Failed");

                            msg.style.display = "block";
                            msg.style.color = "#059669";
                            msg.innerText = `Vehicle created successfully under owner account (#${result.vehicle_id})!`;
                            document.getElementById("addVehicleForm").reset();
                            updateRoleUI();

                            loadVehicles();
                            loadDropdownData();
                        } catch (err) {
                            msg.style.display = "block";
                            msg.style.color = "#dc2626";
                            msg.innerText = err.message;
                        }
                    });

                    // UPDATE STATUS
                    async function updateVehicleStatus(id, newStatus) {
                        if (!newStatus) return;
                        try {
                            await fetch(`${API_URL}/vehicles/${id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ status: newStatus })
                            });
                            loadVehicles();
                            if (currentUser && currentUser.role === "ADMIN") loadAdminPanel();
                        } catch (err) {
                            alert("Failed to update status");
                        }
                    }

                    // DELETE VEHICLE
                    async function deleteVehicle(id) {
                        if (!confirm(`Are you sure you want to delete Vehicle ID #${id}?`)) return;
                        try {
                            await fetch(`${API_URL}/vehicles/${id}`, { method: "DELETE" });
                            loadVehicles();
                            if (currentUser && currentUser.role === "ADMIN") loadAdminPanel();
                        } catch (err) {
                            alert("Failed to delete vehicle");
                        }
                    }

                    // AUTH MODAL LOGIC
                    function openAuthModal() {
                        if (currentUser && currentUser.role !== "GUEST") {
                            // Sign out action
                            currentUser = null;
                            updateRoleUI();
                            switchTab('browseTab');
                            return;
                        }
                        document.getElementById("authModal").classList.add("active");
                    }

                    function closeAuthModal() {
                        document.getElementById("authModal").classList.remove("active");
                    }

                    function switchAuthTab(role) {
                        activeAuthRole = role;
                        document.getElementById("tabAuthCustomer").className = role === 'CUSTOMER' ? "btn btn-primary" : "btn btn-secondary";
                        document.getElementById("tabAuthOwner").className = role === 'OWNER' ? "btn btn-primary" : "btn btn-secondary";
                        document.getElementById("tabAuthAdmin").className = role === 'ADMIN' ? "btn btn-primary" : "btn btn-secondary";

                        const modalTitle = document.getElementById("authModalTitle");
                        const toggleBtn = document.getElementById("toggleAuthModeBtn");
                        const demoHint = document.getElementById("authDemoHint");

                        if (role === 'ADMIN') {
                            isAuthRegister = false;
                            document.getElementById("authRegisterFields").style.display = "none";
                            if (toggleBtn) toggleBtn.style.display = "none";
                            modalTitle.innerHTML = `<i class="fa-solid fa-user-shield" style="color: var(--primary-blue);"></i> Admin Control Sign In`;
                            if (demoHint) {
                                demoHint.style.display = "block";
                                demoHint.innerHTML = `<i class="fa-solid fa-circle-info" style="color: var(--primary-blue); margin-right: 4px;"></i> Super Admin Login Credentials: <code>admin@velocity.com</code> / Password: <strong>admin123</strong>`;
                            }
                        } else {
                            if (toggleBtn) toggleBtn.style.display = "block";
                            modalTitle.innerHTML = isAuthRegister ?
                                `<i class="fa-solid fa-user-plus" style="color: var(--primary-blue);"></i> Register as ${role}` :
                                `<i class="fa-solid fa-user-lock" style="color: var(--primary-blue);"></i> ${role} Sign In`;

                            if (demoHint) {
                                demoHint.style.display = "block";
                                demoHint.innerHTML = `<i class="fa-solid fa-circle-info" style="color: var(--primary-blue); margin-right: 4px;"></i> Default password for existing database accounts: <strong>123456</strong>`;
                            }
                        }
                        const licenseGroup = document.getElementById("authLicenseGroup");
                        const bankGroup = document.getElementById("authBankGroup");
                        const licenseInput = document.getElementById("authLicense");
                        const bankInput = document.getElementById("authBank");

                        if (licenseGroup && bankGroup) {
                            if (role === 'CUSTOMER') {
                                licenseGroup.style.display = isAuthRegister ? "block" : "none";
                                bankGroup.style.display = "none";
                                if (licenseInput) licenseInput.required = isAuthRegister;
                                if (bankInput) bankInput.required = false;
                            } else if (role === 'OWNER') {
                                licenseGroup.style.display = "none";
                                bankGroup.style.display = isAuthRegister ? "block" : "none";
                                if (licenseInput) licenseInput.required = false;
                                if (bankInput) bankInput.required = isAuthRegister;
                            } else {
                                licenseGroup.style.display = "none";
                                bankGroup.style.display = "none";
                            }
                        }
                    }

                    function togglePasswordVisibility() {
                        const passInput = document.getElementById("authPassword");
                        const eyeIcon = document.getElementById("authEyeIcon");
                        if (passInput.type === "password") {
                            passInput.type = "text";
                            eyeIcon.className = "fa-solid fa-eye-slash";
                        } else {
                            passInput.type = "password";
                            eyeIcon.className = "fa-solid fa-eye";
                        }
                    }

                    function toggleAuthMode(e) {
                        e.preventDefault();
                        if (activeAuthRole === 'ADMIN') return;
                        isAuthRegister = !isAuthRegister;
                        const regFields = document.getElementById("authRegisterFields");
                        const btn = document.getElementById("authSubmitBtn");
                        const toggleBtn = document.getElementById("toggleAuthModeBtn");
                        const modalTitle = document.getElementById("authModalTitle");
                        const passLabel = document.getElementById("authPasswordLabel");
                        const passInput = document.getElementById("authPassword");
                        const demoHint = document.getElementById("authDemoHint");

                        if (isAuthRegister) {
                            regFields.style.display = "block";
                            btn.innerText = "Register Account";
                            toggleBtn.innerText = "Already have an account? Sign In";
                            modalTitle.innerHTML = `<i class="fa-solid fa-user-plus" style="color: var(--primary-blue);"></i> Register as ${activeAuthRole}`;
                            if (passLabel) passLabel.innerText = "Create Password *";
                            if (passInput) passInput.placeholder = "Create a secure password";
                            if (demoHint) demoHint.style.display = "none";
                        } else {
                            regFields.style.display = "none";
                            btn.innerText = "Sign In";
                            toggleBtn.innerText = "Don't have an account? Register";
                            modalTitle.innerHTML = `<i class="fa-solid fa-user-lock" style="color: var(--primary-blue);"></i> ${activeAuthRole} Sign In`;
                            if (passLabel) passLabel.innerText = "Password *";
                            if (passInput) passInput.placeholder = "••••••••";
                            if (demoHint) demoHint.style.display = "block";
                        }

                        switchAuthTab(activeAuthRole);
                    }

                    async function handleAuthSubmit(e) {
                        e.preventDefault();
                        const msg = document.getElementById("authMsg");
                        msg.style.display = "none";

                        const email = document.getElementById("authEmail").value.trim();
                        const password = document.getElementById("authPassword").value;

                        const endpoint = activeAuthRole === "CUSTOMER" ?
                            (isAuthRegister ? `${API_URL}/customers/register` : `${API_URL}/customers/login`) :
                            (activeAuthRole === "OWNER" ?
                                (isAuthRegister ? `${API_URL}/owners/register` : `${API_URL}/owners/login`) :
                                `${API_URL}/admins/login`);

                        const payload = { email, password };
                        if (isAuthRegister && activeAuthRole !== 'ADMIN') {
                            const firstName = document.getElementById("authFirstName").value.trim();
                            const lastName = document.getElementById("authLastName").value.trim();
                            const phone = document.getElementById("authPhone").value.trim();

                            if (!firstName || !lastName || !phone) {
                                msg.style.display = "block";
                                msg.style.color = "#dc2626";
                                msg.innerText = "Please enter First Name, Last Name, and Phone Number.";
                                return;
                            }

                            payload.first_name = firstName;
                            payload.last_name = lastName;
                            payload.phone = phone;

                            if (activeAuthRole === "CUSTOMER") {
                                const licenseVal = document.getElementById("authLicense").value.trim();
                                if (!licenseVal || isNaN(licenseVal)) {
                                    msg.style.display = "block";
                                    msg.style.color = "#dc2626";
                                    msg.innerText = "Please enter a valid numeric Driving License Number (e.g. 1234567890).";
                                    return;
                                }
                                payload.driving_license_no = licenseVal;
                            } else if (activeAuthRole === "OWNER") {
                                const bankVal = document.getElementById("authBank").value.trim();
                                if (!bankVal || isNaN(bankVal)) {
                                    msg.style.display = "block";
                                    msg.style.color = "#dc2626";
                                    msg.innerText = "Please enter a valid numeric Bank Account Number (e.g. 9876543210).";
                                    return;
                                }
                                payload.bank_account_no = bankVal;
                            }
                        }

                        try {
                            const res = await fetch(endpoint, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload)
                            });
                            const data = await res.json();

                            if (!res.ok) throw new Error(data.message || "Authentication failed");

                            const userObj = data.customer || data.owner || data.admin || {
                                id: 1,
                                first_name: email.split('@')[0],
                                email,
                                role: activeAuthRole
                            };

                            currentUser = {
                                id: userObj.customer_id || userObj.owner_id || userObj.admin_id || 1,
                                name: userObj.name || `${userObj.first_name || ''} ${userObj.last_name || ''}`.trim() || activeAuthRole,
                                email: userObj.email,
                                role: activeAuthRole
                            };

                            updateRoleUI();
                            closeAuthModal();
                            loadDropdownData();
                            loadVehicles();

                            if (activeAuthRole === "OWNER") switchTab('fleetTab');
                            else if (activeAuthRole === "ADMIN") switchTab('adminTab');
                            else switchTab('browseTab');

                        } catch (err) {
                            msg.style.display = "block";
                            msg.style.color = "#dc2626";
                            msg.innerText = err.message;
                        }
                    }

                    // ADMIN PANEL FUNCTIONS
                    async function loadAdminPanel() {
                        try {
                            const [statsRes, custRes, ownerRes, vehRes] = await Promise.all([
                                fetch(`${API_URL}/admins/stats`),
                                fetch(`${API_URL}/customers`),
                                fetch(`${API_URL}/owners/full`),
                                fetch(`${API_URL}/vehicles`)
                            ]);

                            if (statsRes.ok) {
                                const s = await statsRes.json();
                                document.getElementById("admVehiclesCount").innerText = s.total_vehicles || 0;
                                document.getElementById("admCustomersCount").innerText = s.total_customers || 0;
                                document.getElementById("admOwnersCount").innerText = s.total_owners || 0;
                                document.getElementById("admBookingsCount").innerText = s.total_bookings || 0;
                                document.getElementById("admRevenueCount").innerText = `₹${(s.total_revenue || 0).toLocaleString()}`;
                            }

                            if (custRes.ok) {
                                const customers = await custRes.json();
                                const tbody = document.getElementById("admCustomersTableBody");
                                tbody.innerHTML = "";
                                if (customers.length === 0) {
                                    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No customers registered yet.</td></tr>`;
                                } else {
                                    customers.forEach(c => {
                                        tbody.innerHTML += `
                                <tr>
                                    <td><strong>#${c.CUSTOMER_ID}</strong></td>
                                    <td>${c.FIRST_NAME} ${c.LAST_NAME || ''}</td>
                                    <td>${c.EMAIL}<br><small style="color:var(--text-muted);">${c.PHONE || 'No Phone'}</small></td>
                                    <td><button class="btn btn-danger" style="padding:2px 8px; font-size:11px;" onclick="deleteCustomerAcc(${c.CUSTOMER_ID})">Delete</button></td>
                                </tr>
                            `;
                                    });
                                }
                            }

                            if (ownerRes.ok) {
                                const owners = await ownerRes.json();
                                const tbody = document.getElementById("admOwnersTableBody");
                                tbody.innerHTML = "";
                                if (owners.length === 0) {
                                    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">No vehicle owners registered.</td></tr>`;
                                } else {
                                    owners.forEach(o => {
                                        tbody.innerHTML += `
                                <tr>
                                    <td><strong>#${o.OWNER_ID}</strong></td>
                                    <td>${o.FIRST_NAME} ${o.LAST_NAME || ''}</td>
                                    <td>${o.EMAIL}<br><small style="color:var(--text-muted);">${o.PHONE || 'N/A'}</small></td>
                                    <td><span class="status-badge status-RENTED">${o.VEHICLE_COUNT || 0} Vehicles</span></td>
                                    <td><button class="btn btn-danger" style="padding:2px 8px; font-size:11px;" onclick="deleteOwnerAcc(${o.OWNER_ID})">Delete</button></td>
                                </tr>
                            `;
                                    });
                                }
                            }

                            if (vehRes.ok) {
                                const vehicles = await vehRes.json();
                                const tbody = document.getElementById("admFleetTableBody");
                                tbody.innerHTML = "";
                                vehicles.forEach(v => {
                                    tbody.innerHTML += `
                            <tr>
                                <td><strong>#${v.VEHICLE_ID}</strong></td>
                                <td>${v.REGISTRATION_NO}</td>
                                <td>${v.CATEGORY_NAME || 'N/A'}</td>
                                <td>${v.BRANCH_NAME || 'N/A'} (${v.CITY || 'N/A'})</td>
                                <td>${v.OWNER_NAME || 'N/A'}</td>
                                <td><span class="status-badge status-${v.STATUS}">${v.STATUS}</span></td>
                                <td>
                                    <div style="display:flex; gap:6px;">
                                        <select onchange="updateVehicleStatus(${v.VEHICLE_ID}, this.value)" style="padding:4px 8px; font-size:12px; background:#ffffff; color:#0f172a; border:1px solid #cbd5e1; border-radius:6px;">
                                            <option value="">Change Status</option>
                                            <option value="AVAILABLE" ${v.STATUS === 'AVAILABLE' ? 'selected' : ''}>AVAILABLE</option>
                                            <option value="BOOKED" ${v.STATUS === 'BOOKED' ? 'selected' : ''}>BOOKED</option>
                                            <option value="RENTED" ${v.STATUS === 'RENTED' ? 'selected' : ''}>RENTED</option>
                                            <option value="MAINTENANCE" ${v.STATUS === 'MAINTENANCE' ? 'selected' : ''}>MAINTENANCE</option>
                                        </select>
                                        <button class="btn btn-danger" style="padding:4px 8px; font-size:12px;" onclick="deleteVehicle(${v.VEHICLE_ID})">Delete</button>
                                    </div>
                                </td>
                            </tr>
                        `;
                                });
                            }
                        } catch (err) {
                            console.warn("Admin panel load notice:", err);
                        }
                    }

                    async function deleteCustomerAcc(id) {
                        if (!confirm(`Delete Customer Account #${id}?`)) return;
                        try {
                            await fetch(`${API_URL}/customers/${id}`, { method: "DELETE" });
                            loadAdminPanel();
                        } catch (err) { alert("Failed to delete customer"); }
                    }

                    async function deleteOwnerAcc(id) {
                        if (!confirm(`Delete Vehicle Owner Account #${id}?`)) return;
                        try {
                            await fetch(`${API_URL}/owners/${id}`, { method: "DELETE" });
                            loadAdminPanel();
                        } catch (err) { alert("Failed to delete owner"); }
                    }

                    // PAYMENT MODAL LOGIC
                    function openPaymentModal(vehicleId) {
                        if (!currentUser || currentUser.role !== "CUSTOMER") {
                            openAuthModal();
                            alert("Please sign in as a Customer to rent a vehicle.");
                            return;
                        }

                        selectedVehicleForPay = allVehicles.find(v => v.VEHICLE_ID === vehicleId);
                        if (!selectedVehicleForPay) return;

                        document.getElementById("payVehicleTitle").innerText = `Registration: ${selectedVehicleForPay.REGISTRATION_NO || 'Vehicle #' + vehicleId}`;
                        document.getElementById("payVehicleCategory").innerText = `Category: ${selectedVehicleForPay.CATEGORY_NAME || 'Standard'} • Branch: ${selectedVehicleForPay.BRANCH_NAME || 'Main'}`;

                        const ownerName = selectedVehicleForPay.OWNER_NAME || 'Velocity Fleet';
                        const ownerPhone = selectedVehicleForPay.OWNER_PHONE ? `📞 ${selectedVehicleForPay.OWNER_PHONE}` : 'Helpline: +91 7821942320';
                        const ownerContactEl = document.getElementById("payOwnerContact");
                        if (ownerContactEl) {
                            ownerContactEl.innerHTML = `<i class="fa-solid fa-user-tie"></i> Vehicle Owner: <strong>${ownerName}</strong> &nbsp;|&nbsp; <i class="fa-solid fa-phone"></i> <strong>${ownerPhone}</strong>`;
                        }

                        calculateRentalPrice();
                        document.getElementById("paymentModal").classList.add("active");
                    }

                    function closePaymentModal() {
                        document.getElementById("paymentModal").classList.remove("active");
                    }

                    function calculateRentalPrice() {
                        const start = new Date(document.getElementById("payStartDate").value);
                        const end = new Date(document.getElementById("payEndDate").value);

                        let days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                        if (isNaN(days) || days < 1) days = 1;

                        const total = days * 1500;
                        document.getElementById("payTotalAmount").innerText = `₹${total.toLocaleString()}`;
                        document.getElementById("payRentalDays").innerText = `${days} Day${days > 1 ? 's' : ''}`;
                    }

                    async function handlePaymentSubmit(e) {
                        e.preventDefault();
                        const msg = document.getElementById("paymentMsg");
                        msg.style.display = "none";

                        const start_date = document.getElementById("payStartDate").value;
                        const end_date = document.getElementById("payEndDate").value;
                        const payment_method = document.getElementById("payMethod").value;

                        const start = new Date(start_date);
                        const end = new Date(end_date);
                        let days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
                        if (isNaN(days) || days < 1) days = 1;
                        const total_amount = days * 1500;

                        const payload = {
                            vehicle_id: selectedVehicleForPay.VEHICLE_ID,
                            customer_id: currentUser ? currentUser.id : 1,
                            customer_name: currentUser ? currentUser.name : "Valued Customer",
                            start_date,
                            end_date,
                            total_amount,
                            payment_method
                        };

                        try {
                            const res = await fetch(`${API_URL}/bookings`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload)
                            });
                            const data = await res.json();

                            if (!res.ok) throw new Error(data.message || "Payment failed");

                            msg.style.display = "block";
                            msg.style.color = "#059669";
                            msg.innerText = `Payment Successful! Booking ID #${data.booking_id} confirmed. Opening downloadable receipt...`;

                            setTimeout(async () => {
                                closePaymentModal();
                                loadVehicles();
                                switchTab('bookingsTab');
                                await viewReceipt(data.booking_id);
                            }, 1400);

                        } catch (err) {
                            msg.style.display = "block";
                            msg.style.color = "#dc2626";
                            msg.innerText = err.message;
                        }
                    }

                    // LOAD ROLE-SCOPED BOOKINGS & PAYMENT HISTORY
                    async function loadBookings() {
                        try {
                            if (!currentUser || currentUser.role === "GUEST") return;

                            let url = `${API_URL}/bookings`;
                            if (currentUser.role === "CUSTOMER") {
                                url = `${API_URL}/bookings?customer_id=${currentUser.id}`;
                            } else if (currentUser.role === "OWNER") {
                                url = `${API_URL}/bookings?owner_id=${currentUser.id}`;
                            }
                            // ADMIN gets all system bookings

                            const res = await fetch(url);
                            if (!res.ok) return;
                            const bookings = await res.json();

                            const tbody = document.getElementById("bookingsTableBody");
                            tbody.innerHTML = "";

                            if (bookings.length === 0) {
                                tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; color: var(--text-muted); padding: 24px;">No rental bookings recorded yet.</td></tr>`;
                                return;
                            }

                            bookings.forEach(b => {
                                const row = document.createElement("tr");
                                const dateRange = `${b.START_DATE ? b.START_DATE.substring(0, 10) : ''} to ${b.END_DATE ? b.END_DATE.substring(0, 10) : ''}`;
                                const txnRef = b.TRANSACTION_REF || `TXN${b.BOOKING_ID}`;
                                const payMethod = b.PAYMENT_METHOD || 'UPI';

                                row.innerHTML = `
                            <td><strong>#${b.BOOKING_ID}</strong></td>
                            <td><span style="font-family:monospace; font-weight:700; color:var(--primary-blue); font-size:12px;">${txnRef}</span></td>
                            <td>${b.REGISTRATION_NO || 'Vehicle #' + b.VEHICLE_ID} <br><small style="color:var(--text-muted);">${b.CATEGORY_NAME || 'Standard'}</small></td>
                            <td>${b.CUSTOMER_NAME || 'Customer'}</td>
                            <td>${dateRange}</td>
                            <td><strong style="color:var(--primary-blue);">₹${parseFloat(b.TOTAL_AMOUNT || 0).toLocaleString()}</strong></td>
                            <td><span style="font-size:11px; font-weight:700; background:#f1f5f9; padding:2px 8px; border-radius:4px; color:#475569;">${payMethod}</span></td>
                            <td>
                                <button class="btn btn-primary" style="padding:4px 10px; font-size:12px; white-space:nowrap;" onclick="viewReceipt(${b.BOOKING_ID})">
                                    <i class="fa-solid fa-file-invoice-dollar"></i> Receipt
                                </button>
                            </td>
                        `;
                                tbody.appendChild(row);
                            });
                        } catch (err) {
                            console.warn("Bookings fetch notice:", err);
                        }
                    }

                    // DOWNLOADABLE RECEIPT MODAL LOGIC
                    let currentReceiptData = null;

                    async function viewReceipt(bookingId) {
                        try {
                            const res = await fetch(`${API_URL}/bookings/${bookingId}`);
                            if (!res.ok) throw new Error("Failed to load receipt");
                            const data = await res.json();
                            openReceiptModalWithData(data);
                        } catch (err) {
                            alert("Could not load receipt details: " + err.message);
                        }
                    }

                    function openReceiptModalWithData(data) {
                        currentReceiptData = data;
                        document.getElementById("rcptBookingId").innerText = `#${data.BOOKING_ID}`;
                        document.getElementById("rcptTxnRef").innerText = data.TRANSACTION_REF || `TXN${data.BOOKING_ID}`;
                        document.getElementById("rcptPayMethod").innerText = data.PAYMENT_METHOD || 'UPI';
                        document.getElementById("rcptCustName").innerText = data.CUSTOMER_NAME || 'Valued Customer';
                        document.getElementById("rcptCustEmail").innerText = data.CUSTOMER_EMAIL || (currentUser ? currentUser.email : 'N/A');
                        document.getElementById("rcptCustPhone").innerText = data.CUSTOMER_PHONE || 'N/A';
                        document.getElementById("rcptVehReg").innerText = data.REGISTRATION_NO || `Vehicle #${data.VEHICLE_ID}`;
                        document.getElementById("rcptVehCat").innerText = data.CATEGORY_NAME || 'Standard';
                        document.getElementById("rcptLocation").innerText = [data.CITY, data.LOCATION_AREA, data.BRANCH_NAME].filter(Boolean).join(" - ") || 'Main Hub';
                        document.getElementById("rcptDates").innerText = `${data.START_DATE ? data.START_DATE.substring(0, 10) : ''} to ${data.END_DATE ? data.END_DATE.substring(0, 10) : ''}`;
                        document.getElementById("rcptTotalAmount").innerText = `₹${parseFloat(data.TOTAL_AMOUNT || 0).toLocaleString()}`;
                        const ownerContactStr = data.OWNER_PHONE ? ` | 📞 Phone: ${data.OWNER_PHONE}` : '';
                        document.getElementById("rcptOwnerInfo").innerText = `Vehicle Owner: ${data.OWNER_NAME || 'Velocity Fleet'}${ownerContactStr}`;
                        document.getElementById("rcptCreatedDate").innerText = `Date: ${data.PAYMENT_DATE ? new Date(data.PAYMENT_DATE).toLocaleString() : new Date().toLocaleDateString()}`;

                        document.getElementById("receiptModal").classList.add("active");
                    }

                    function closeReceiptModal() {
                        document.getElementById("receiptModal").classList.remove("active");
                    }

                    function printReceipt() {
                        const receiptContent = document.getElementById("receiptPrintArea").innerHTML;
                        const printWin = window.open('', '', 'width=800,height=900');
                        printWin.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>Velocity Rentals - Receipt #${currentReceiptData ? currentReceiptData.BOOKING_ID : ''}</title>
                        <style>
                            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #1e293b; }
                            .btn { display: none !important; }
                            .status-badge { padding: 4px 12px; background: #ecfdf5; color: #059669; border-radius: 12px; font-weight: 700; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        ${receiptContent}
                        <script>window.onload = function() { window.print(); window.close(); }<\/script>
                    </body>
                    </html>
                `);
                        printWin.document.close();
                    }

                    function downloadReceiptFile() {
                        if (!currentReceiptData) return;
                        const bookingId = currentReceiptData.BOOKING_ID;
                        const txnRef = currentReceiptData.TRANSACTION_REF || `TXN${bookingId}`;
                        const custName = currentReceiptData.CUSTOMER_NAME || 'Customer';
                        const vehicleReg = currentReceiptData.REGISTRATION_NO || `Vehicle #${currentReceiptData.VEHICLE_ID}`;
                        const totalAmount = parseFloat(currentReceiptData.TOTAL_AMOUNT || 0).toLocaleString();
                        const dates = `${currentReceiptData.START_DATE ? currentReceiptData.START_DATE.substring(0, 10) : ''} to ${currentReceiptData.END_DATE ? currentReceiptData.END_DATE.substring(0, 10) : ''}`;
                        const payMethod = currentReceiptData.PAYMENT_METHOD || 'UPI';
                        const ownerInfoStr = `${currentReceiptData.OWNER_NAME || 'Velocity Fleet'}${currentReceiptData.OWNER_PHONE ? ' | Phone: ' + currentReceiptData.OWNER_PHONE : ''}`;

                        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt_${bookingId}_Velocity_Rentals</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; margin: 0; padding: 40px 20px; color: #1e293b; }
        .receipt-box { max-width: 650px; margin: 0 auto; background: #ffffff; border: 2px solid #2563eb; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px; }
        .brand { font-size: 24px; font-weight: 800; color: #2563eb; }
        .status { background: #ecfdf5; color: #059669; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 13px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
        .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; font-size: 14px; }
        .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        th { background: #eff6ff; color: #2563eb; padding: 12px; text-align: left; font-size: 13px; }
        td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
        .total-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; }
        .amount { font-size: 28px; font-weight: 800; color: #15803d; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
    </style>
</head>
<body>
    <div class="receipt-box">
        <div class="header">
            <div>
                <div class="brand">🏎️ VELOCITY RENTALS</div>
                <div style="font-size: 13px; color: #64748b;">Official Vehicle Rental Payment Receipt</div>
            </div>
            <div>
                <span class="status">✓ PAYMENT SUCCESSFUL</span>
            </div>
        </div>
        <div class="grid">
            <div class="info-card">
                <div class="label">Transaction Details</div>
                <div><strong>Booking ID:</strong> #${bookingId}</div>
                <div><strong>Txn Ref:</strong> ${txnRef}</div>
                <div><strong>Payment Method:</strong> ${payMethod}</div>
            </div>
            <div class="info-card">
                <div class="label">Customer Details</div>
                <div><strong>Customer Name:</strong> ${custName}</div>
                <div><strong>Email:</strong> ${currentReceiptData.CUSTOMER_EMAIL || 'N/A'}</div>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th>Vehicle Item</th>
                    <th>Rental Period</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>${vehicleReg}</strong> (${currentReceiptData.CATEGORY_NAME || 'Standard'})</td>
                    <td>${dates}</td>
                    <td><strong>₹${totalAmount}</strong></td>
                </tr>
            </tbody>
        </table>
        <div class="total-box">
            <div>
                <div style="font-size: 12px; color: #166534; font-weight: 700;">TOTAL AMOUNT PAID</div>
                <div style="font-size: 12px; color: #15803d;">Owner: ${ownerInfoStr}</div>
            </div>
            <div class="amount">₹${totalAmount}</div>
        </div>
            <div class="amount">₹${totalAmount}</div>
        </div>
        <div class="footer">
            Thank you for choosing Velocity Rentals! For 24/7 support call +91 7821942320 or email sbwork429@gmail.com.
        </div>
    </div>
</body>
</html>
                `;

                        const blob = new Blob([htmlContent], { type: "text/html" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `Velocity_Receipt_Booking_${bookingId}.html`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    }
                    // MAINTENANCE LOGIC (OWNER MODULE)
                    function populateMaintenanceVehicleSelect(vehicles) {
                        const sel = document.getElementById("maintVehicleSelect");
                        sel.innerHTML = '<option value="">Select Vehicle</option>';

                        let myVehicles = vehicles;
                        if (currentUser && currentUser.role === "OWNER") {
                            myVehicles = vehicles.filter(v => v.OWNER_ID === currentUser.id);
                        }

                        myVehicles.forEach(v => {
                            const isMine = currentUser && currentUser.role === "OWNER" && v.OWNER_ID === currentUser.id;
                            sel.innerHTML += `<option value="${v.VEHICLE_ID}">#${v.VEHICLE_ID} - ${v.REGISTRATION_NO} (${v.CATEGORY_NAME || 'Vehicle'}) ${isMine ? '★ [Your Vehicle]' : '[' + (v.OWNER_NAME || 'Fleet') + ']'}</option>`;
                        });
                    }

                    function openMaintenanceModal() {
                        document.getElementById("maintenanceModal").classList.add("active");
                    }

                    function closeMaintenanceModal() {
                        document.getElementById("maintenanceModal").classList.remove("active");
                    }

                    async function loadMaintenance() {
                        try {
                            const isOwner = currentUser && currentUser.role === "OWNER";
                            const url = isOwner ? `${API_URL}/maintenance?owner_id=${currentUser.id}` : `${API_URL}/maintenance`;

                            const res = await fetch(url);
                            const tbody = document.getElementById("maintenanceTableBody");
                            tbody.innerHTML = "";

                            if (!res.ok) return;
                            const records = await res.json();

                            let recordsList = records;
                            if (isOwner) {
                                recordsList = records.filter(r => r.OWNER_ID === currentUser.id || (r.OWNER_NAME && currentUser.name && r.OWNER_NAME.toLowerCase().trim() === currentUser.name.toLowerCase().trim()));
                            }

                            if (recordsList.length === 0) {
                                tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; color: var(--text-muted); padding: 30px;">No vehicle maintenance logs found. Click "Update Vehicle Documents" above to add one.</td></tr>`;
                                return;
                            }

                            recordsList.forEach(r => {
                                const isMine = currentUser && currentUser.role === "OWNER" && r.OWNER_NAME && currentUser.name && r.OWNER_NAME.toUpperCase() === currentUser.name.toUpperCase();
                                const cond = r.VEHICLE_CONDITION || 'EXCELLENT';
                                const row = document.createElement("tr");
                                row.innerHTML = `
                        <td><strong>#${r.VEHICLE_ID} - ${r.REGISTRATION_NO}</strong><br><small style="color:var(--text-muted); font-size:11px;">Owner: ${r.OWNER_NAME || 'Fleet'} ${isMine ? '<span style="color:var(--primary-blue); font-weight:700;">(You)</span>' : ''}</small></td>
                        <td>${r.INSURANCE_POLICY_NO || 'N/A'}</td>
                        <td>${r.INSURANCE_EXPIRY ? r.INSURANCE_EXPIRY.substring(0, 10) : 'N/A'}</td>
                        <td>${r.PUC_CERTIFICATE_NO || 'N/A'}</td>
                        <td>${r.PUC_EXPIRY ? r.PUC_EXPIRY.substring(0, 10) : 'N/A'}</td>
                        <td>${r.NEXT_SERVICE_DATE ? r.NEXT_SERVICE_DATE.substring(0, 10) : 'N/A'}</td>
                        <td><span class="condition-badge condition-${cond}"><i class="fa-solid fa-circle-dot" style="font-size:8px;"></i> ${cond.replace(/_/g, ' ')}</span></td>
                        <td><div style="max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${r.NOTES || 'None'}">${r.NOTES || 'None'}</div></td>
                        <td>
                            <button class="btn btn-outline-red" style="padding:4px 8px; font-size:12px; white-space:nowrap;" onclick="editMaintenanceForVehicle(${r.VEHICLE_ID})"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                        </td>
                    `;
                                tbody.appendChild(row);
                            });
                        } catch (err) {
                            console.warn("Maintenance fetch notice:", err);
                        }
                    }

                    async function handleMaintenanceSubmit(e) {
                        e.preventDefault();
                        const msg = document.getElementById("maintMsg");
                        msg.style.display = "none";

                        const payload = {
                            vehicle_id: parseInt(document.getElementById("maintVehicleSelect").value),
                            insurance_policy_no: document.getElementById("maintInsuranceNo").value.trim(),
                            insurance_expiry: document.getElementById("maintInsuranceExpiry").value,
                            puc_certificate_no: document.getElementById("maintPucNo").value.trim(),
                            puc_expiry: document.getElementById("maintPucExpiry").value,
                            next_service_date: document.getElementById("maintNextService").value,
                            vehicle_condition: document.getElementById("maintCondition").value,
                            notes: document.getElementById("maintNotes").value.trim()
                        };

                        try {
                            const res = await fetch(`${API_URL}/maintenance`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload)
                            });
                            const data = await res.json();

                            if (!res.ok) throw new Error(data.message || "Save failed");

                            msg.style.display = "block";
                            msg.style.color = "#34d399";
                            msg.innerText = "Maintenance record saved successfully!";

                            setTimeout(() => {
                                closeMaintenanceModal();
                                loadMaintenance();
                                loadVehicles();
                            }, 1200);
                        } catch (err) {
                            msg.style.display = "block";
                            msg.style.color = "#ff6b81";
                            msg.innerText = err.message;
                        }
                    }

                    function editMaintenanceForVehicle(vehicleId) {
                        document.getElementById("maintVehicleSelect").value = vehicleId;
                        openMaintenanceModal();
                    }

                    // FAQ TOGGLE
                    function toggleFaq(el) {
                        el.classList.toggle("active");
                    }

                    // CONTACT FORM SUBMIT
                    async function handleContactSubmit(e) {
                        e.preventDefault();
                        const msg = document.getElementById("contactMsg");
                        msg.style.display = "none";

                        const name = document.getElementById("contactName").value.trim();
                        const email = document.getElementById("contactEmail").value.trim();
                        const message = document.getElementById("contactMessage").value.trim();

                        if (!name || !email || !message) {
                            msg.style.display = "block";
                            msg.style.color = "#dc2626";
                            msg.innerText = "Please fill in all fields before sending.";
                            return;
                        }

                        try {
                            const res = await fetch(`${API_URL}/contact`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ name, email, message })
                            });
                            const data = await res.json();

                            if (!res.ok) throw new Error(data.message || "Failed to send message");

                            msg.style.display = "block";
                            msg.style.color = "#059669";
                            msg.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${data.message}`;

                            // Trigger mailto link so user's local email app pre-populates email to sbwork429@gmail.com
                            if (data.mailto_url) {
                                window.location.href = data.mailto_url;
                            }
                            e.target.reset();
                            setTimeout(() => { msg.style.display = "none"; }, 6000);
                        } catch (err) {
                            msg.style.display = "block";
                            msg.style.color = "#dc2626";
                            msg.innerText = err.message;
                        }
                    }
                