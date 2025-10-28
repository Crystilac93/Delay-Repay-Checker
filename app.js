// --- Form Elements ---
        const searchForm = document.getElementById('search-form');
        const submitButton = document.getElementById('submit-button');
        const statusMessage = document.getElementById('status-message');
        const loadingSpinner = document.getElementById('loading');
        const loadingMessage = document.getElementById('loading-message');
        const settingsToggleButton = document.getElementById('settings-toggle-button');
        const closeSettingsButton = document.getElementById('close-settings-button');
        const settingsPanel = document.getElementById('settings-panel');
        const settingsOverlay = document.getElementById('settings-overlay');
        const saveSettingsButton = document.getElementById('save-settings-button');
        const loadSettingsButton = document.getElementById('load-settings-button');
        const skeletonLoader = document.getElementById('skeleton-loader');
        const searchTypeRadios = document.querySelectorAll('input[name="search-type"]');
        const datePickerLabel = document.getElementById('date-picker-label');
        const daysInOfficeGroup = document.getElementById('days-in-office-group');

        // --- Result Table Bodies ---
        const resultsBodyOffice = document.getElementById('results-body-office');
        const resultsBodyOther = document.getElementById('results-body-other');
        const noOfficeResultsMsg = document.getElementById('no-office-results');
        const noOtherResultsMsg = document.getElementById('no-other-results');
        // REMOVED: table search inputs
        // NEW: toggle switch inputs
        const toggleOfficeDelays = document.getElementById('toggle-office-delays');
        const toggleOtherDelays = document.getElementById('toggle-other-delays');


        // --- Error Report Elements ---
        const errorReportArea = document.getElementById('error-report-area');
        const errorList = document.getElementById('error-list');

        // --- Input Elements ---
        const datePicker = document.getElementById('date-picker');
        const weekCommencingLabel = document.getElementById('week-commencing-label');
        const daysInOfficeCheckboxes = document.querySelectorAll('input[name="daysInOffice"]');
        const ticketPriceInput = document.getElementById('ticket-price-settings');
        
        // Station inputs from settings panel (DISPLAY inputs)
        const settingOutboundFrom = document.getElementById('setting-outbound-from');
        const settingOutboundTo = document.getElementById('setting-outbound-to');
        const settingInboundFrom = document.getElementById('setting-inbound-from');
        const settingInboundTo = document.getElementById('setting-inbound-to');
        // Station inputs from settings panel (HIDDEN CRS inputs)
        const settingOutboundFromCode = document.getElementById('setting-outbound-from-code');
        const settingOutboundToCode = document.getElementById('setting-outbound-to-code');
        const settingInboundFromCode = document.getElementById('setting-inbound-from-code');
        const settingInboundToCode = document.getElementById('setting-inbound-to-code');

        // Labels for station codes in main form
        const outboundStationsLabel = document.getElementById('outbound-stations-label');
        const inboundStationsLabel = document.getElementById('inbound-stations-label');
        // NEW: Change journey buttons
        const changeOutboundJourneyBtn = document.getElementById('change-outbound-journey');
        const changeInboundJourneyBtn = document.getElementById('change-inbound-journey');


        // UPDATED: Time Inputs (replaces sliders)
        const fromTimeOutbound = document.getElementById('from-time-outbound');
        const toTimeOutbound = document.getElementById('to-time-outbound');
        const fromTimeInbound = document.getElementById('from-time-inbound');
        const toTimeInbound = document.getElementById('to-time-inbound');


        // --- KPI Elements ---
        const resultsArea = document.getElementById('results-area');
        // Office KPIs
        // const totalJourneysKPIOffice = document.getElementById('total-journeys-kpi-office'); // REMOVED
        const cancelledKPIOffice = document.getElementById('cancelled-kpi-office');
        const delayed1529Office = document.getElementById('delayed-15-29-office');
        const delayed3059Office = document.getElementById('delayed-30-59-office');
        const delayed60119Office = document.getElementById('delayed-60-119-office');
        const delayed120PlusOffice = document.getElementById('delayed-120-plus-office');
        const totalRefundKPIOffice = document.getElementById('total-refund-kpi-office');
        // Other KPIs
        // const totalJourneysKPIOther = document.getElementById('total-journeys-kpi-other'); // REMOVED
        const cancelledKPIOther = document.getElementById('cancelled-kpi-other');
        const delayed1529Other = document.getElementById('delayed-15-29-other');
        const delayed3059Other = document.getElementById('delayed-30-59-other');
        const delayed60119Other = document.getElementById('delayed-60-119-other');
        const delayed120PlusOther = document.getElementById('delayed-120-plus-other');
        const totalRefundKPIOther = document.getElementById('total-refund-kpi-other');
        // Other Weekday section elements for hiding/showing
        const otherWeekdaysSummaryHeading = document.getElementById('other-weekdays-summary-heading');
        const otherWeekdaysKpiGrid = document.getElementById('other-weekdays-kpi-grid');
        const otherWeekdaysTableCard = document.getElementById('other-weekdays-table-card');
        // NEW: Dynamic Heading IDs
        const inOfficeSummaryHeading = document.getElementById('in-office-summary-heading');
        const inOfficeTableHeading = document.getElementById('in-office-table-heading');


        // --- Loader Element ---
        const progressRing = document.getElementById('progress-ring');
        const circumference = 2 * Math.PI * 15.9155; // Radius of the circle
        progressRing.style.strokeDashoffset = circumference;
        
        // --- Utility ---
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        const WEEKDAYS_MAP = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; // Match getDay() output
        
        // --- Core Helper Functions (Moved to Top for Execution Order) ---

        function getMonday(d) { d = new Date(d); let day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1); return new Date(d.setDate(diff)); }
        function formatDateForAPI(date) { const y = date.getFullYear(), m = (date.getMonth() + 1).toString().padStart(2, '0'), d = date.getDate().toString().padStart(2, '0'); return `${y}-${m}-${d}`; }
        function formatDateForDisplay(date) { return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
        
        // Update station labels in the main form based on settings
         function updateJourneyLabels() {
             outboundStationsLabel.textContent = `(${settingOutboundFromCode.value} → ${settingOutboundToCode.value})`;
             inboundStationsLabel.textContent = `(${settingInboundFromCode.value} → ${settingInboundToCode.value})`;
         }

        // --- Price Input Formatting (Used by loadSettings) ---
        let rawPriceValue = parseFloat(String(ticketPriceInput.value).replace(/[^0-9.]/g, '')) || 0; // Initialize raw value
        function formatPriceInput() { const inputVal = String(ticketPriceInput.value); const numValue = parseFloat(inputVal.replace(/[^0-9.]/g, '')) || 0; rawPriceValue = numValue; ticketPriceInput.value = '£' + numValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); ticketPriceInput.classList.add('is-formatted'); }
        function unformatPriceInput() { ticketPriceInput.value = rawPriceValue; ticketPriceInput.classList.remove('is-formatted'); ticketPriceInput.select(); }
        function getRawTicketPrice() { return parseFloat(String(ticketPriceInput.value).replace(/[^0-9.]/g, '')) || 0; } // Parse current value


        // --- Settings Persistence (Must be available before the loadSettings call) ---

        function loadSettings(isManual = false) {
             const savedSettings = localStorage.getItem('railDelayFinderSettings');
             if (savedSettings) {
                 try {
                     const settings = JSON.parse(savedSettings);
                     if (settings.ticketPrice) { ticketPriceInput.value = settings.ticketPrice; formatPriceInput(); }
                     if (settings.daysInOffice && Array.isArray(settings.daysInOffice)) { const savedDays = new Set(settings.daysInOffice); daysInOfficeCheckboxes.forEach(cb => { cb.checked = savedDays.has(cb.value); }); }
                     settingOutboundFromCode.value = settings.outboundFrom || 'DID';
                     settingOutboundFrom.value = settings.outboundFromDisplay || 'Didcot Parkway [DID]';
                     settingOutboundToCode.value = settings.outboundTo || 'PAD';
                     settingOutboundTo.value = settings.outboundToDisplay || 'London Paddington [PAD]';
                     settingInboundFromCode.value = settings.inboundFrom || 'PAD';
                     settingInboundFrom.value = settings.inboundFromDisplay || 'London Paddington [PAD]';
                     settingInboundToCode.value = settings.inboundTo || 'DID';
                     settingInboundTo.value = settings.inboundToDisplay || 'Didcot Parkway [DID]';
                     
                     // NEW: Load saved times into time inputs
                     fromTimeOutbound.value = settings.fromTimeOutbound || '07:00';
                     toTimeOutbound.value = settings.toTimeOutbound || '07:30';
                     fromTimeInbound.value = settings.fromTimeInbound || '17:00';
                     toTimeInbound.value = settings.toTimeInbound || '17:30';

                     updateJourneyLabels(); 
                     if (isManual) showStatus('Settings loaded.', 'info');
                 } catch (e) { console.error("Error loading settings:", e); showStatus('Could not load settings.', 'error'); }
             } else {
                  formatPriceInput(); // Format default price if no settings
                  updateJourneyLabels(); // Update labels with default stations
                  if (isManual) showStatus('No saved settings found.', 'info');
             }
         }


        // --- Form Submission (Main Logic) ---
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const searchType = document.querySelector('input[name="search-type"]:checked').value;
            setLoading(true, "Starting search...", 0);
            skeletonLoader.classList.remove('hidden');
            submitButton.disabled = true;
            resultsArea.classList.add('opacity-0', 'hidden');
            errorReportArea.classList.add('opacity-0', 'hidden');
            errorList.innerHTML = '';
            showStatus('', 'info');
            resultsBodyOffice.innerHTML = ''; resultsBodyOther.innerHTML = '';
            noOfficeResultsMsg.classList.add('hidden'); noOtherResultsMsg.classList.add('hidden');
            // UPDATED: Reset toggles instead of search bars (Set to TRUE for default ON)
            toggleOfficeDelays.checked = true;
            toggleOtherDelays.checked = true;

            let allServices = []; let allRids = [];
            let failedRequests = [];
            const officeDays = new Set();
            if (searchType === 'week') {
                daysInOfficeCheckboxes.forEach(cb => { if (cb.checked) officeDays.add(parseInt(cb.value, 10)); });
            }

            // Get station codes from *hidden* code inputs
             const outboundFrom = settingOutboundFromCode.value;
             const outboundTo = settingOutboundToCode.value;
             const inboundFrom = settingInboundFromCode.value;
             const inboundTo = settingInboundToCode.value;

            // NEW: Get times from time inputs and format them
             const journeyTypes = [
                 { type: "Outbound (Work)", from_loc: outboundFrom, to_loc: outboundTo, from_time: formatTimeForAPI(fromTimeOutbound.value), to_time: formatTimeForAPI(toTimeOutbound.value), label: "Outbound" },
                 { type: "Inbound (Home)", from_loc: inboundFrom, to_loc: inboundTo, from_time: formatTimeForAPI(fromTimeInbound.value), to_time: formatTimeForAPI(toTimeInbound.value), label: "Inbound" }
             ];


            let daysToFetch = [];
            if (searchType === 'week') { const monday = getMonday(new Date(datePicker.value)); for (let i = 0; i < 5; i++) { const d = new Date(monday.getTime()); d.setDate(monday.getDate() + i); daysToFetch.push(formatDateForAPI(d)); } }
            else { daysToFetch.push(formatDateForAPI(new Date(datePicker.value))); }

            const totalMetricsFetches = daysToFetch.length * journeyTypes.length;
            let metricsFetches = 0;

            try {
                // --- Step 1: Fetch Metrics ---
                for (const dateStr of daysToFetch) {
                    const currentDayDate = new Date(dateStr + 'T00:00:00Z'); const dayOfWeekIndex = currentDayDate.getUTCDay();
                     if (searchType === 'day' && (dayOfWeekIndex === 0 || dayOfWeekIndex === 6)) { showStatus(`Selected date (${dateStr}) is not a weekday.`, 'info'); continue; }

                    for (const journey of journeyTypes) {
                        metricsFetches++; const progressPercent = (metricsFetches / totalMetricsFetches) * 0.5;
                        setLoading(true, `Fetching ${journey.label} services for ${WEEKDAYS_MAP[dayOfWeekIndex]} (${dateStr})...`, progressPercent);
                        const payload = { from_loc: journey.from_loc, to_loc: journey.to_loc, from_time: journey.from_time, to_time: journey.to_time, from_date: dateStr, to_date: dateStr, days: "WEEKDAY" };
                        let metricsResponse; let attempt = 1; let success = false;
                        while(attempt <= 2 && !success) {
                            try {
                                metricsResponse = await fetch(METRICS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                                if (!metricsResponse.ok) {
                                    if (metricsResponse.status === 429 && attempt === 1) { showStatus(`Rate limit hit fetching list for ${dateStr} (${journey.label}). Retrying...`, 'warning'); await wait(RETRY_DELAY); attempt++; continue; }
                                    else if (metricsResponse.status === 429 && attempt === 2) { failedRequests.push(`Service list for ${dateStr} (${journey.label}) (failed after retry)`); showStatus(`Rate limit persisted for ${dateStr} list. Skipping...`, 'warning'); break; }
                                    else { const errorData = await metricsResponse.json().catch(() => ({ detail: { errorcode: `HTTP ${metricsResponse.status}` } })); showStatus(`Error on ${dateStr} (${journey.label}): ${JSON.stringify(errorData.fault?.detail || errorData)}`, 'error'); failedRequests.push(`Service list for ${dateStr} (${journey.label}) - Error ${metricsResponse.status}`); break; }
                                }
                                const metricsData = await metricsResponse.json();
                                if (metricsData.Services) { metricsData.Services.forEach(service => { const rid = service.serviceAttributesMetrics?.rids?.[0]; if (rid && !allRids.includes(rid)) { allRids.push(rid); allServices.push({ rid: rid, date: dateStr, journeyType: journey.type, from_loc: journey.from_loc, to_loc: journey.to_loc }); } }); }
                                success = true;
                            } catch (fetchError) { failedRequests.push(`Service list for ${dateStr} (${journey.label}) - Network Error (Attempt ${attempt})`); showStatus(`Network error fetching ${dateStr} (${journey.label}). Skipping...`, 'error'); break;
                            } finally { if (success || attempt >= 2) { await wait(RATE_LIMIT_DELAY); } }
                        } // End while retry
                    } // End journey loop
                } // End date loop

                if (allServices.length === 0 && failedRequests.length === 0) { showStatus('Success! No services found.', 'info'); skeletonLoader.classList.add('hidden'); setLoading(false); submitButton.disabled = false; return; }
                else if (allServices.length === 0 && failedRequests.length > 0) { showStatus('Finished. No services found, requests failed.', 'warning'); }

                // --- Step 2: Fetch Details ---
                let detailedServices = []; const totalDetails = allServices.length;
                if (totalDetails > 0) {
                     for (let i = 0; i < totalDetails; i++) {
                        const serviceContext = allServices[i]; const rid = serviceContext.rid;
                        const progressPercent = 0.5 + ((i + 1) / totalDetails * 0.5);
                        setLoading(true, `Fetching details for train ${i + 1} of ${totalDetails}...`, progressPercent); // Simplified msg
                        let detailsResponse; let detailsData; let attempt = 1; let success = false;
                        while (attempt <= 2 && !success) {
                            try {
                                detailsResponse = await fetch(DETAILS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rid: rid }) });
                                if (!detailsResponse.ok) {
                                    if (detailsResponse.status === 429 && attempt === 1) { showStatus(`Rate limit for RID ${rid}. Retrying...`, 'warning'); await wait(RETRY_DELAY); attempt++; continue; }
                                    else if (detailsResponse.status === 429 && attempt === 2) { failedRequests.push(`Details for RID ${rid} on ${serviceContext.date} (${serviceContext.journeyType}) (failed retry)`); showStatus(`Rate limit persisted for RID ${rid}. Skipping.`, 'warning'); break; }
                                    else { const errorData = await detailsResponse.json().catch(() => ({ detail: { errorcode: `HTTP ${detailsResponse.status}` } })); showStatus(`Error on RID ${rid}: ${JSON.stringify(errorData.fault?.detail || errorData)}`, 'error'); failedRequests.push(`Details for RID ${rid} on ${serviceContext.date} (${serviceContext.journeyType}) - Error ${detailsResponse.status}`); break; }
                                }
                                detailsData = await detailsResponse.json(); success = true;
                            } catch(fetchError) { failedRequests.push(`Details for RID ${rid} on ${serviceContext.date} (${serviceContext.journeyType}) - Network Error (Attempt ${attempt})`); showStatus(`Network error for RID ${rid}. Skipping.`, 'error'); break;
                            } finally { if (success || attempt >= 2) { await wait(RATE_LIMIT_DELAY); } }
                        } // End while retry

                        if (success && detailsData) {
                             const serviceDetails = detailsData.serviceAttributesDetails; const locations = serviceDetails?.locations || [];
                            const departureInfo = locations.find(loc => loc.location === serviceContext.from_loc); const arrivalInfo = locations.find(loc => loc.location === serviceContext.to_loc); const serviceDate = serviceContext.date;
                            if (departureInfo && arrivalInfo && serviceDetails) {
                                detailedServices.push({ rid: rid, journeyType: serviceContext.journeyType, dateOfService: serviceDate, scheduledDeparture: departureInfo.gbtt_ptd, scheduledArrival: arrivalInfo.gbtt_pta, actualArrival: arrivalInfo.actual_ta, reason: arrivalInfo.late_canc_reason || '' });
                            } else { failedRequests.push(`Details incomplete for RID ${rid} on ${serviceContext.date} (${serviceContext.journeyType})`); }
                        }
                    } // End for details loop
                } // End if totalDetails > 0

                // --- Step 3: Display Results ---
                setLoading(false); skeletonLoader.classList.add('hidden');
                if (failedRequests.length > 0) { errorReportArea.classList.remove('hidden'); setTimeout(() => errorReportArea.classList.remove('opacity-0'), 50); displayFailedRequests(failedRequests); }

                if (detailedServices.length > 0) {
                    const finalStatus = failedRequests.length > 0 ? `Finished. Found ${detailedServices.length} service(s), but some data missing.` : `Success! Found ${detailedServices.length} service(s).`;
                    showStatus(finalStatus, failedRequests.length > 0 ? 'warning' : 'success');

                    detailedServices.sort((a, b) => { if (a.dateOfService < b.dateOfService) return -1; if (a.dateOfService > b.dateOfService) return 1; const typeA = a.journeyType.startsWith("Outbound") ? 0 : 1; const typeB = b.journeyType.startsWith("Outbound") ? 0 : 1; if (typeA < typeB) return -1; if (typeA < typeB) return 1; if (a.scheduledDeparture < b.scheduledDeparture) return -1; if (a.scheduledDeparture > b.scheduledDeparture) return 1; return 0; });

                    const officeServices = []; const otherServices = [];

                    // Filter based on search type
                    if (searchType === 'week') {
                         // NEW: Reset headings for week search
                         inOfficeSummaryHeading.textContent = 'In-Office Summary';
                         inOfficeTableHeading.textContent = 'In-Office Journey Details';

                         detailedServices.forEach(service => { const [y, m, d] = service.dateOfService.split('-').map(Number); const serviceDate = new Date(Date.UTC(y, m - 1, d)); const day = serviceDate.getUTCDay(); if (officeDays.has(day)) officeServices.push(service); else otherServices.push(service); });
                    } else { // searchType === 'day' - all results go into 'office' for display
                         // NEW: Set headings for day search
                         inOfficeSummaryHeading.textContent = 'Day Summary';
                         inOfficeTableHeading.textContent = 'Day Journey Details';
                        
                         officeServices.push(...detailedServices);
                         // Hide the "Other Weekdays" section entirely
                         otherWeekdaysSummaryHeading.classList.add('hidden');
                         otherWeekdaysKpiGrid.classList.add('hidden');
                         otherWeekdaysTableCard.classList.add('hidden');
                    }
                     // Ensure sections are visible if searching by week again later
                     if(searchType === 'week') {
                        otherWeekdaysSummaryHeading.classList.remove('hidden');
                        otherWeekdaysKpiGrid.classList.remove('hidden');
                        otherWeekdaysTableCard.classList.remove('hidden');
                     }

                    // UPDATED: calculateKPIs function (removed total)
                    const calculateKPIs = (services) => { let counts = { cancelled: 0, delayed_15_29: 0, delayed_30_59: 0, delayed_60_119: 0, delayed_120_plus: 0 }; let totalRefund = 0; services.forEach(s => { const cancelled = !s.actualArrival || s.actualArrival === ""; const delayMins = calculateDelay(s.scheduledArrival, s.actualArrival); const delayInfo = getDelayInfo(delayMins, s.actualArrival); if(cancelled) counts.cancelled++; else if (delayMins >= 120) counts.delayed_120_plus++; else if (delayMins >= 60) counts.delayed_60_119++; else if (delayMins >= 30) counts.delayed_30_59++; else if (delayMins >= 15) counts.delayed_15_29++; totalRefund += delayInfo.refund; }); return { counts, refund: totalRefund }; };

                    const officeKPIs = calculateKPIs(officeServices);
                    const otherKPIs = calculateKPIs(otherServices);

                    // UPDATED: Populate Office KPIs (removed total)
                    cancelledKPIOffice.textContent = officeKPIs.counts.cancelled; delayed1529Office.textContent = officeKPIs.counts.delayed_15_29; delayed3059Office.textContent = officeKPIs.counts.delayed_30_59; delayed60119Office.textContent = officeKPIs.counts.delayed_60_119; delayed120PlusOffice.textContent = officeKPIs.counts.delayed_120_plus; totalRefundKPIOffice.textContent = `£${officeKPIs.refund.toFixed(2)}`;
                    
                    // UPDATED: Populate Other KPIs (removed total)
                    if(searchType === 'week') {
                        cancelledKPIOther.textContent = otherKPIs.counts.cancelled; delayed1529Other.textContent = otherKPIs.counts.delayed_15_29; delayed3059Other.textContent = otherKPIs.counts.delayed_30_59; delayed60119Other.textContent = otherKPIs.counts.delayed_60_119; delayed120PlusOther.textContent = otherKPIs.counts.delayed_120_plus; totalRefundKPIOther.textContent = `£${otherKPIs.refund.toFixed(2)}`;
                    }
                    
                    // --- REMOVED: Save to History ---

                    resultsArea.classList.remove('hidden'); setTimeout(() => resultsArea.classList.remove('opacity-0'), 50);
                    displayResults(officeServices, resultsBodyOffice, noOfficeResultsMsg);
                    // Only display the 'other' table if searching by week
                    if (searchType === 'week') {
                        displayResults(otherServices, resultsBodyOther, noOtherResultsMsg);
                    }


                } else if (failedRequests.length === 0) { showStatus('Finished. No services found.', 'info'); resultsArea.classList.add('hidden'); }

            } catch (error) { console.error('Unexpected Error:', error); showStatus(`Unexpected error: ${error.message}`, 'error'); skeletonLoader.classList.add('hidden'); setLoading(false);
            } finally { submitButton.disabled = false; }
        });

        // --- Table Display ---
        function displayResults(services, tableBody, noResultsElement) {
            tableBody.innerHTML = ''; // Clear
            if (services.length === 0) { 
                // UPDATED: Reset no results text
                noResultsElement.textContent = noResultsElement.id === 'no-office-results' ? 'No journeys found for selected in-office days.' : 'No journeys found for other weekdays.';
                noResultsElement.classList.remove('hidden'); 
                tableBody.closest('table').classList.add('hidden'); 
                return; 
            }
            noResultsElement.classList.add('hidden'); tableBody.closest('table').classList.remove('hidden');

            services.forEach(service => {
                const isCancelled = !service.actualArrival || service.actualArrival === "";
                const delayMinutes = calculateDelay(service.scheduledArrival, service.actualArrival);
                const delayInfo = getDelayInfo(delayMinutes, service.actualArrival);
                const actualArrivalDisplay = isCancelled ? '<span class="text-danger font-semibold">Cancelled</span>' : formatTime(service.actualArrival);
                
                const row = document.createElement('tr'); row.className = 'hover:bg-slate-100 transition-colors duration-150';
                row.innerHTML = `
                    <td class="py-3 px-6 whitespace-nowrap text-sm text-gray-700">${service.dateOfService}</td>
                    <td class="py-3 px-6 whitespace-nowrap text-sm text-gray-700">${service.journeyType}</td>
                    <td class="py-3 px-6 whitespace-nowrap text-sm text-gray-700">${formatTime(service.scheduledDeparture)}</td>
                    <td class="py-3 px-6 whitespace-nowrap text-sm text-gray-700">${formatTime(service.scheduledArrival)}</td>
                    <td class="py-3 px-6 whitespace-nowrap text-sm ${delayInfo.style}">${actualArrivalDisplay}</td>
                    <td class="py-3 px-6 whitespace-nowrap text-sm ${delayInfo.style}">${delayInfo.category} ${delayInfo.category !== 'Cancelled' && delayInfo.category !== 'On Time' ? `(${delayMinutes}m)`: ''}</td>
                    <td class="py-3 px-6 whitespace-nowrap text-sm ${delayInfo.style}">£${delayInfo.refund.toFixed(2)}</td>
                `; tableBody.appendChild(row);
            });
            
            // UPDATED: Reset toggles to ON and apply delay filter
            const toggle = tableBody.id === 'results-body-office' ? toggleOfficeDelays : toggleOtherDelays;
            toggle.checked = true; // Reset toggle to "on" (default)
            filterTableByDelay(tableBody, true); // Apply "show delays only" filter
        }


        // --- Error Report Display ---
        function displayFailedRequests(failures) { errorList.innerHTML = ''; failures.forEach(msg => { const li = document.createElement('li'); li.textContent = msg; errorList.appendChild(li); }); errorReportArea.classList.remove('hidden'); setTimeout(() => errorReportArea.classList.remove('opacity-0'), 50); }

        // --- Date & Time Helpers ---
        function getMonday(d) { d = new Date(d); let day = d.getDay(), diff = d.getDate() - day + (day == 0 ? -6 : 1); return new Date(d.setDate(diff)); }
        function formatDateForAPI(date) { const y = date.getFullYear(), m = (date.getMonth() + 1).toString().padStart(2, '0'), d = date.getDate().toString().padStart(2, '0'); return `${y}-${m}-${d}`; }
        function formatDateForDisplay(date) { return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
        
        // NEW: Formats time from "HH:MM" to "HHMM" for API
        function formatTimeForAPI(timeStr) {
             if (!timeStr) return "0000"; // Fallback
             return timeStr.replace(':', '');
         }


        // --- Slider & Time Helpers --- (REMOVED)


        // --- Calculation Helpers ---
        function calculateDelay(scheduled, actual) { if (!actual || actual === "") return Infinity; const schTime = parseApiTime(scheduled), actTime = parseApiTime(actual); if (!schTime || !actTime) return 0; if (actTime.getTime() < schTime.getTime() - 43200000) actTime.setUTCDate(actTime.getUTCDate() + 1); const diffMs = actTime.getTime() - schTime.getTime(), diffMins = Math.round(diffMs / 60000); return diffMins > 0 ? diffMins : 0; }
        function parseApiTime(timeStr) { if (!timeStr || timeStr.length !== 4) return null; const h = parseInt(timeStr.substring(0, 2), 10), m = parseInt(timeStr.substring(2, 4), 10); return new Date(Date.UTC(1970, 0, 1, h, m, 0)); }
        function formatTime(timeStr) { if (!timeStr || timeStr.length !== 4) return timeStr || 'N/A'; return `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`; }
        // UPDATED: getDelayInfo to set "On Time" and not use "text-danger" for 0 delays
        function getDelayInfo(minutes, actualArrival) { 
            const isCancelled = (!actualArrival || actualArrival === ""); 
            let percentage = 0, category = "On Time", style = "text-gray-900", refund = 0; 
            if (isCancelled) { 
                category = "Cancelled"; style = "text-danger"; percentage = 0; 
            } else if (minutes >= 120) { 
                percentage = 2.00; category = "200%"; style = "text-danger"; 
            } else if (minutes >= 60) { 
                percentage = 1.00; category = "100%"; style = "text-danger"; 
            } else if (minutes >= 30) { 
                percentage = 0.50; category = "50%"; style = "text-danger"; 
            } else if (minutes >= 15) { 
                percentage = 0.25; category = "25%"; style = "text-danger"; 
            } else {
                category = "On Time"; style = "text-gray-900"; // Explicitly set On Time
            }
            if (!isCancelled) { 
                const currentTicketPrice = getRawTicketPrice(); 
                if (currentTicketPrice > 0) { 
                    const singleJourneyCost = currentTicketPrice / JOURNEYS_PER_YEAR; 
                    refund = singleJourneyCost * percentage; 
                } else refund = 0; 
            } 
            return { category, refund, style }; 
        }

        // --- UI State Helpers ---
        function setLoading(isLoading, message = "", progress = 0) { const clampedProgress = Math.max(0, Math.min(1, progress)); if (isLoading) { loadingSpinner.classList.remove('hidden'); loadingSpinner.classList.add('flex'); statusMessage.textContent = ''; loadingMessage.textContent = message; const offset = circumference - clampedProgress * circumference; progressRing.style.strokeDashoffset = offset; } else { loadingSpinner.classList.add('hidden'); loadingSpinner.classList.remove('flex'); loadingMessage.textContent = ''; progressRing.style.strokeDashoffset = 0; setTimeout(() => { progressRing.style.strokeDashoffset = circumference; }, 500); } }
        function showStatus(message, type) { statusMessage.textContent = message; statusMessage.className = 'text-sm text-left '; if (type === 'error') statusMessage.classList.add('text-danger'); else if (type === 'success') statusMessage.classList.add('text-success', 'font-medium'); else if (type === 'info') statusMessage.classList.add('text-emerald-600'); else if (type === 'warning') statusMessage.classList.add('text-warning'); }

         // --- Settings Persistence ---
         function getSettingsFromForm() {
             return {
                 ticketPrice: getRawTicketPrice(),
                 daysInOffice: Array.from(daysInOfficeCheckboxes).filter(cb => cb.checked).map(cb => cb.value),
                 outboundFrom: settingOutboundFromCode.value,
                 outboundTo: settingOutboundToCode.value,
                 inboundFrom: settingInboundFromCode.value,
                 inboundTo: settingInboundToCode.value,
                 outboundFromDisplay: settingOutboundFrom.value,
                 outboundToDisplay: settingOutboundTo.value,
                 inboundFromDisplay: settingInboundFrom.value,
                 inboundToDisplay: settingInboundTo.value,
                 // NEW: Save time input values
                 fromTimeOutbound: fromTimeOutbound.value,
                 toTimeOutbound: toTimeOutbound.value,
                 fromTimeInbound: fromTimeInbound.value,
                 toTimeInbound: toTimeInbound.value
             };
         }

        function saveSettings() {
             const settings = getSettingsFromForm();
             localStorage.setItem('railDelayFinderSettings', JSON.stringify(settings));
             showStatus('Settings saved.', 'success');
             setTimeout(() => { if (statusMessage.textContent === 'Settings saved.') showStatus('', 'info'); }, 3000);
             updateJourneyLabels(); // Update main form labels after saving
         }
        
         // --- Search History (REMOVED) ---

        saveSettingsButton.addEventListener('click', saveSettings);
        loadSettingsButton.addEventListener('click', () => {
             loadSettings(true); // Pass true for manual load
             const settingsStatus = document.querySelector('#settings-footer p');
             if(settingsStatus) settingsStatus.textContent = "Settings loaded.";
             setTimeout(() => { if(settingsStatus) settingsStatus.textContent = "Settings are saved in your browser."; }, 3000);
         });


        // --- Price Input Formatting ---
        ticketPriceInput.addEventListener('blur', formatPriceInput); ticketPriceInput.addEventListener('focus', unformatPriceInput);

         // --- Settings Panel Toggle ---
         function toggleSettingsPanel(show) { 
             if (show) { 
                 // REMOVED: loadSearchHistory();
                 settingsOverlay.classList.remove('hidden'); 
                 settingsPanel.classList.remove('translate-x-full'); 
                 setTimeout(() => settingsOverlay.classList.remove('opacity-0'), 10); 
             } else { 
                 settingsOverlay.classList.add('opacity-0'); 
                 settingsPanel.classList.add('translate-x-full'); 
                 setTimeout(() => settingsOverlay.classList.add('hidden'), 300); 
             } 
         }
         settingsToggleButton.addEventListener('click', () => toggleSettingsPanel(true));
         closeSettingsButton.addEventListener('click', () => toggleSettingsPanel(false));
         settingsOverlay.addEventListener('click', () => toggleSettingsPanel(false));
         
         // NEW: Event listeners for "Change" journey buttons
         changeOutboundJourneyBtn.addEventListener('click', () => toggleSettingsPanel(true));
         changeInboundJourneyBtn.addEventListener('click', () => toggleSettingsPanel(true));


        // --- Search Type Toggle ---
        searchTypeRadios.forEach(radio => {
             radio.addEventListener('change', (e) => {
                 const isWeekSearch = e.target.value === 'week';
                 datePickerLabel.textContent = isWeekSearch ? 'Select Week' : 'Select Day';
                 // Use visibility to maintain layout space for week commencing label
                 weekCommencingLabel.style.visibility = isWeekSearch ? 'visible' : 'hidden';
                 daysInOfficeGroup.style.display = isWeekSearch ? 'block' : 'none'; // Hide/show checkboxes
                 if (isWeekSearch) updateWeekCommencingLabel(); // Update label if switching back to week
             });
         });

        // --- Autocomplete Logic ---
        const autocompleteInputs = [
             { input: settingOutboundFrom, results: document.getElementById('results-setting-outbound-from'), codeInput: settingOutboundFromCode },
             { input: settingOutboundTo, results: document.getElementById('results-setting-outbound-to'), codeInput: settingOutboundToCode },
             { input: settingInboundFrom, results: document.getElementById('results-setting-inbound-from'), codeInput: settingInboundFromCode },
             { input: settingInboundTo, results: document.getElementById('results-setting-inbound-to'), codeInput: settingInboundToCode }
         ];
         let activeAutocompleteIndex = -1;

        autocompleteInputs.forEach(({ input, results, codeInput }) => {
            input.addEventListener('input', () => handleAutocompleteInput(input, results, codeInput));
            input.addEventListener('focus', () => handleAutocompleteInput(input, results, codeInput));
            input.addEventListener('blur', () => setTimeout(() => hideAutocompleteResults(results), 150)); // Delay to allow click
             input.addEventListener('keydown', (e) => handleAutocompleteKeydown(e, input, results, codeInput));
        });

         function handleAutocompleteInput(input, resultsContainer, codeInput) {
             const query = input.value.trim().toLowerCase();
             resultsContainer.innerHTML = ''; activeAutocompleteIndex = -1; 
             
             // If user just selected an item, don't re-filter
             if (input.value.includes('[') && input.value.includes(']')) {
                 // Check if the value matches the stored code
                 if (`[${codeInput.value.toLowerCase()}]` === input.value.slice(-5).toLowerCase()) {
                     hideAutocompleteResults(resultsContainer);
                     return;
                 }
             }

             if (!query) { hideAutocompleteResults(resultsContainer); return; }

             const filteredStations = (typeof stationData !== 'undefined' ? stationData : []).filter(station =>
                 station.name.toLowerCase().includes(query) || station.code.toLowerCase().includes(query)
             ).slice(0, 5); 

             if (filteredStations.length > 0) {
                 filteredStations.forEach((station, index) => {
                     const item = document.createElement('div');
                     item.classList.add('autocomplete-item');
                     item.dataset.name = station.name; item.dataset.code = station.code; item.dataset.index = index;
                     // Highlight logic improved
                     const regex = new RegExp(`(${query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
                     item.innerHTML = `${station.name} [${station.code}]`.replace(regex, '<strong>$1</strong>');
                     
                     item.addEventListener('mousedown', (e) => { e.preventDefault(); selectAutocompleteItem(station, input, resultsContainer, codeInput); });
                     resultsContainer.appendChild(item);
                 });
                 resultsContainer.classList.remove('hidden');
             } else { hideAutocompleteResults(resultsContainer); }
         }
         function hideAutocompleteResults(resultsContainer) { resultsContainer.classList.add('hidden'); activeAutocompleteIndex = -1; }
         function selectAutocompleteItem(station, input, resultsContainer, codeInput) {
             const displayText = `${station.name} [${station.code}]`;
             input.value = displayText; // Set display text
             codeInput.value = station.code; // Set hidden CRS code
             hideAutocompleteResults(resultsContainer);
             updateJourneyLabels(); // Update labels in main form
         }
         function handleAutocompleteKeydown(e, input, resultsContainer, codeInput) {
             const items = resultsContainer.querySelectorAll('.autocomplete-item'); if (items.length === 0) return;
             if (e.key === 'ArrowDown') { e.preventDefault(); activeAutocompleteIndex = (activeAutocompleteIndex + 1) % items.length; updateAutocompleteHighlight(items); } 
             else if (e.key === 'ArrowUp') { e.preventDefault(); activeAutocompleteIndex = (activeAutocompleteIndex - 1 + items.length) % items.length; updateAutocompleteHighlight(items); } 
             else if (e.key === 'Enter' && activeAutocompleteIndex > -1) { e.preventDefault(); const selectedItem = items[activeAutocompleteIndex]; const station = { name: selectedItem.dataset.name, code: selectedItem.dataset.code }; selectAutocompleteItem(station, input, resultsContainer, codeInput); } 
             else if (e.key === 'Escape') { hideAutocompleteResults(resultsContainer); }
         }
         function updateAutocompleteHighlight(items) { items.forEach((item, index) => { if (index === activeAutocompleteIndex) { item.classList.add('is-active'); item.scrollIntoView({ block: 'nearest' }); } else { item.classList.remove('is-active'); } }); }


        // --- Page Load ---
        function setDefaultDate() { const today = new Date(); datePicker.value = formatDateForAPI(today); updateWeekCommencingLabel(); } // Default to today
        function updateWeekCommencingLabel() { try { if (!datePicker.value) { weekCommencingLabel.textContent = ''; return; } const selectedDate = new Date(datePicker.value); const monday = getMonday(selectedDate); weekCommencingLabel.textContent = `w/c ${formatDateForDisplay(monday)}`; } catch (e) { weekCommencingLabel.textContent = 'Invalid date'; } }
        datePicker.addEventListener('input', updateWeekCommencingLabel);

        setDefaultDate(); 
        loadSettings(false); // Load settings on start, 'false' means not manual
        
        // REMOVED: Init slider labels

        // Ensure initial state of days in office group matches default radio
        if (document.querySelector('input[name="search-type"]:checked').value === 'day') {
             daysInOfficeGroup.style.display = 'none';
             weekCommencingLabel.style.visibility = 'hidden'; // Hide label initially if day selected
        }
        
        // REMOVED: Load search history on page load

        // NEW: Add table toggle filter event listeners
        toggleOfficeDelays.addEventListener('change', () => filterTableByDelay(resultsBodyOffice, toggleOfficeDelays.checked));
        toggleOtherDelays.addEventListener('change', () => filterTableByDelay(resultsBodyOther, toggleOtherDelays.checked));

        // NEW: Filter function for table toggles
        function filterTableByDelay(tableBody, delaysOnly) {
            const rows = tableBody.getElementsByTagName('tr');
            let hasVisibleRows = false;
            for (const row of rows) {
                if (delaysOnly) {
                    // Check the 6th cell (index 5) for delay/cancel text
                    const delayCell = row.cells[5];
                    // "text-danger" is applied to all delays/cancellations
                    if (delayCell && delayCell.classList.contains('text-danger')) {
                        row.style.display = '';
                        hasVisibleRows = true;
                    } else {
                        row.style.display = 'none';
                    }
                } else {
                    // Show all rows
                    row.style.display = '';
                    hasVisibleRows = true;
                }
            }
            
            // Handle "no results" message
            const noResultsEl = tableBody.id === 'results-body-office' ? noOfficeResultsMsg : noOtherResultsMsg;
            if (!hasVisibleRows && rows.length > 0) {
                 noResultsEl.textContent = 'No matching delays found for this filter.';
                 noResultsEl.classList.remove('hidden');
            } else if (rows.length > 0) {
                 noResultsEl.classList.add('hidden');
            } else {
                 // This handles the initial "No journeys found" case
                 noResultsEl.textContent = noResultsEl.id === 'no-office-results' ? 'No journeys found for selected in-office days.' : 'No journeys found for other weekdays.';
            }
        }

    </script>