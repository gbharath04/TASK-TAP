import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase-config';

export const databaseService = {
  // Jobs Collection
  async createJob(jobData, employerId) {
    try {
      const jobRef = await addDoc(collection(db, 'jobs'), {
        ...jobData,
        employerId,
        status: 'open',
        createdAt: serverTimestamp(),
        applicationsCount: 0
      });
      return jobRef.id;
    } catch (error) {
      throw error;
    }
  },

  async getJobs(filters = {}) {
    try {
      let jobsQuery = collection(db, 'jobs');
      if (filters.category) {
        jobsQuery = query(jobsQuery, where('category', '==', filters.category));
      }
      if (filters.status) {
        jobsQuery = query(jobsQuery, where('status', '==', filters.status));
      }
      jobsQuery = query(jobsQuery, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(jobsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  },

  // Applications Subcollection
  async applyForJob(jobId, workerId, applicationData) {
    try {
      const applicationRef = await addDoc(
        collection(db, `jobs/${jobId}/applications`),
        {
          ...applicationData,
          workerId,
          status: 'applied',
          createdAt: serverTimestamp()
        }
      );

      // Update applications count
      const jobRef = doc(db, 'jobs', jobId);
      const jobDoc = await getDoc(jobRef);
      await updateDoc(jobRef, {
        applicationsCount: (jobDoc.data().applicationsCount || 0) + 1
      });

      return applicationRef.id;
    } catch (error) {
      throw error;
    }
  },

  async getJobApplications(jobId) {
    try {
      const applicationsQuery = query(
        collection(db, `jobs/${jobId}/applications`),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(applicationsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  },

  // User Profiles
  async getUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
    } catch (error) {
      throw error;
    }
  },

  async updateUserProfile(userId, updateData) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updateData);
    } catch (error) {
      throw error;
    }
  }
}; 