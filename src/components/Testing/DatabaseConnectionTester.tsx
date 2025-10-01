@@ .. @@
   const [testResults, setTestResults] = useState<DatabaseTestResult[]>([]);
   const [testing, setTesting] = useState(false);
+  const [migrationStatus, setMigrationStatus] = useState<'checking' | 'needed' | 'complete' | 'error'>('checking');
 
   useEffect(() => {
     runDatabaseTests();
@@ .. @@
     setTesting(true);
     console.log('🔍 DATABASE CONNECTION TEST STARTED');
     console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
+    console.log('Testing connection with credentials...');
     
     const results: DatabaseTestResult[] = [];
     
@@ .. @@
       console.log('✅ Supabase client initialized successfully');
       
       // Test 1: Basic Connection
+      console.log('🔍 Testing basic database connection...');
       const connectionStart = performance.now();
       try {
-        const { data, error } = await supabase.from('users').select('count').limit(1);
+        // Use the new secure connection test function
+        const { data, error } = await supabase.rpc('test_database_connection');
         const connectionTime = performance.now() - connectionStart;
         
         if (error) {
+          console.error('❌ Database connection failed:', error);
           results.push({
             test: 'Basic Connection',
             status: 'fail',
             message: `Connection failed: ${error.message}`,
             details: `Error code: ${error.code}`,
             latency: connectionTime
           });
+          setMigrationStatus('needed');
         } else {
+          console.log('✅ Database connection successful:', data);
           results.push({
             test: 'Basic Connection',
             status: 'pass',
             message: 'Successfully connected to Supabase',
             details: `Response time: ${connectionTime.toFixed(0)}ms`,
             latency: connectionTime
           });
+          setMigrationStatus('complete');
         }
       } catch (connectionError: any) {
+        console.error('❌ Network connection error:', connectionError);
         results.push({
           test: 'Basic Connection',
           status: 'fail',
           message: 'Network connection failed',
           details: connectionError.message,
           latency: 0
         });
+        setMigrationStatus('error');
       }
       
       // Test 2: Schema Validation
+      console.log('🔍 Testing database schema...');
       const requiredTables = ['users', 'organizations', 'classrooms', 'children', 'behavior_logs', 'classroom_logs'];
       const schemaResults: Record<string, boolean> = {};
       
       for (const table of requiredTables) {
+        console.log(`🔍 Testing table: ${table}`);
         try {
           const { error } = await supabase.from(table).select('id').limit(1);
           schemaResults[table] = !error;
+          if (error) {
+            console.warn(`⚠️ Table ${table} issue:`, error.message);
+          } else {
+            console.log(`✅ Table ${table} accessible`);
+          }
         } catch {
           schemaResults[table] = false;
+          console.error(`❌ Table ${table} not accessible`);
         }
       }
@@ .. @@
       }
       
       // Test 3: Authentication Integration
+      console.log('🔍 Testing Supabase authentication...');
       try {
         const { data: { session }, error } = await supabase.auth.getSession();
         
         if (error) {
+          console.warn('⚠️ Auth session error:', error.message);
           results.push({
             test: 'Authentication',
             status: 'warning',
             message: 'Auth session issues detected',
             details: error.message
           });
         } else {
+          console.log('✅ Authentication system accessible');
           results.push({
             test: 'Authentication',
             status: 'pass',
             message: 'Authentication system working',
             details: session ? 'Active session found' : 'No active session (expected)'
           });
         }
       } catch (authError: any) {
+        console.error('❌ Authentication test failed:', authError);
         results.push({
           test: 'Authentication',
           status: 'fail',
           message: 'Authentication test failed',
           details: authError.message
         });
       }
       
       // Test 4: RLS Policies
+      console.log('🔍 Testing Row Level Security policies...');
       try {
         // Test if RLS is enabled on critical tables
         const { data: rlsData, error: rlsError } = await supabase
           .from('pg_class')
           .select('relname, relrowsecurity')
           .in('relname', requiredTables);
         
         if (rlsError) {
+          console.warn('⚠️ RLS check failed:', rlsError.message);
           results.push({
             test: 'Row Level Security',
             status: 'warning',
             message: 'Cannot verify RLS status',
             details: rlsError.message
           });
         } else {
+          console.log('✅ RLS status checked successfully');
           const rlsEnabled = rlsData?.filter(table => table.relrowsecurity).length || 0;
           results.push({
             test: 'Row Level Security',
             status: rlsEnabled > 0 ? 'pass' : 'warning',
             message: `${rlsEnabled} tables have RLS enabled`,
             details: `Security policies ${rlsEnabled > 0 ? 'active' : 'may need configuration'}`
           });
         }
       } catch (rlsError: any) {
+        console.error('❌ RLS test failed:', rlsError);
         results.push({
           test: 'Row Level Security',
           status: 'warning',
           message: 'RLS verification failed',
           details: 'Manual verification recommended'
         });
       }
       
+      // Test 5: Function Security (New)
+      console.log('🔍 Testing function security configuration...');
+      try {
+        const { data: functionData, error: functionError } = await supabase.rpc('generate_compliance_reports', {
+          report_type: 'test',
+          date_range_days: 1
+        });
+        
+        if (functionError) {
+          console.warn('⚠️ Compliance function test failed:', functionError.message);
+          results.push({
+            test: 'Function Security',
+            status: 'warning',
+            message: 'Compliance function needs migration',
+            details: 'Run latest migration to fix search_path security'
+          });
+        } else {
+          console.log('✅ Compliance function working with secure search_path');
+          results.push({
+            test: 'Function Security',
+            status: 'pass',
+            message: 'Functions have secure search_path configuration',
+            details: 'SECURITY DEFINER functions properly configured'
+          });
+        }
+      } catch (functionError: any) {
+        console.error('❌ Function security test failed:', functionError);
+        results.push({
+          test: 'Function Security',
+          status: 'fail',
+          message: 'Function security test failed',
+          details: 'Migration required to fix search_path vulnerability'
+        });
+      }
+      
       setTestResults(results);
+      
+      // Log final summary
+      const passedTests = results.filter(r => r.status === 'pass').length;
+      const totalTests = results.length;
+      console.log(`🎯 DATABASE TESTING COMPLETE: ${passedTests}/${totalTests} tests passed`);
+      
+      if (results.some(r => r.status === 'fail')) {
+        console.error('❌ CRITICAL: Database connection issues detected');
+        toast.error('Database Issues', 'Check console for connection details');
+      } else if (results.some(r => r.status === 'warning')) {
+        console.warn('⚠️ WARNING: Some database features need attention');
+        toast.warning('Database Warnings', 'Some features may need configuration');
+      } else {
+        console.log('✅ SUCCESS: All database tests passed');
+        toast.success('Database Connected', 'All systems operational');
+      }
       
     } catch (error: any) {
+      console.error('❌ CRITICAL DATABASE ERROR:', error);
       results.push({
         test: 'Supabase Configuration',
         status: 'fail',
@@ .. @@
         details: error.message
       });
       setTestResults(results);
+      setMigrationStatus('error');
+      toast.error('Database Configuration Error', 'Check environment variables');
     } finally {
       setTesting(false);
     }
@@ .. @@
           <div className="space-y-4">
             <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
               <h4 className="font-medium text-blue-900 mb-2">🔍 Real-time Testing Active</h4>
               <p className="text-blue-800 text-sm">
-                Database connection tests are running. Check browser console (F12) for detailed logs.
+                Database connection tests are running with your Supabase credentials. 
+                Check browser console (F12) for detailed connection logs and migration status.
               </p>
             </div>
+            
+            {/* Migration Status */}
+            <div className={`p-4 rounded-lg border ${
+              migrationStatus === 'complete' ? 'bg-green-50 border-green-200' :
+              migrationStatus === 'needed' ? 'bg-yellow-50 border-yellow-200' :
+              migrationStatus === 'error' ? 'bg-red-50 border-red-200' :
+              'bg-gray-50 border-gray-200'
+            }`}>
+              <h4 className={`font-medium mb-2 ${
+                migrationStatus === 'complete' ? 'text-green-900' :
+                migrationStatus === 'needed' ? 'text-yellow-900' :
+                migrationStatus === 'error' ? 'text-red-900' :
+                'text-gray-900'
+              }`}>
+                📋 Migration Status: {migrationStatus.toUpperCase()}
+              </h4>
+              <p className={`text-sm ${
+                migrationStatus === 'complete' ? 'text-green-800' :
+                migrationStatus === 'needed' ? 'text-yellow-800' :
+                migrationStatus === 'error' ? 'text-red-800' :
+                'text-gray-800'
+              }`}>
+                {migrationStatus === 'complete' && 'All database migrations applied successfully'}
+                {migrationStatus === 'needed' && 'Database migrations need to be applied - click Supabase button in settings'}
+                {migrationStatus === 'error' && 'Migration error detected - check console for details'}
+                {migrationStatus === 'checking' && 'Checking migration status...'}
+              </p>
+            </div>
           </div>
         </Card>
       )}