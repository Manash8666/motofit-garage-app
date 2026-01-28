/**
 * Parse Cloud Code
 * Define server-side logic, triggers, and custom functions here
 */
import Parse from 'parse/node';

// Example: beforeSave trigger for Job class
Parse.Cloud.beforeSave('Job', async (request: Parse.Cloud.BeforeSaveRequest) => {
    const job = request.object;

    // Auto-generate job number if not provided
    if (!job.get('jobNo')) {
        const query = new Parse.Query('Job');
        const count = await query.count({ useMasterKey: true });
        job.set('jobNo', `JC-${String(count + 1).padStart(3, '0')}`);
    }

    // Set timestamps
    if (!job.existed()) {
        job.set('createdAt', new Date());
    }
    job.set('updatedAt', new Date());
});

// Example: Custom cloud function
Parse.Cloud.define('getJobStats', async (request: Parse.Cloud.FunctionRequest) => {
    const query = new Parse.Query('Job');

    const totalJobs = await query.count({ useMasterKey: true });

    const completedQuery = new Parse.Query('Job');
    completedQuery.equalTo('status', 'Completed');
    const completedJobs = await completedQuery.count({ useMasterKey: true });

    const pendingQuery = new Parse.Query('Job');
    pendingQuery.equalTo('status', 'Pending');
    const pendingJobs = await pendingQuery.count({ useMasterKey: true });

    return {
        totalJobs,
        completedJobs,
        pendingJobs,
        activeJobs: totalJobs - completedJobs
    };
});

export { };
