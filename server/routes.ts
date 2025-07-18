import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Service Categories Routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = await storage.createServiceCategory(req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // Services Routes
  app.get("/api/services", async (req, res) => {
    try {
      const { category, search, priceRange, sortBy } = req.query;
      const services = await storage.getServices({
        category: category as string,
        search: search as string,
        priceRange: priceRange as string,
        sortBy: sortBy as string,
      });
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(parseInt(req.params.id));
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const service = await storage.createService(req.body);
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  // Bookings Routes
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const booking = await storage.createBooking(req.body);
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.put("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.updateBooking(parseInt(req.params.id), req.body);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  // Provider Dashboard Routes
  app.get("/api/provider/stats", async (req, res) => {
    try {
      // Mock provider stats - in real app, this would be calculated from database
      const stats = {
        totalBookings: 247,
        totalEarnings: 8547,
        averageRating: 4.8,
        activeServices: 3,
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider stats" });
    }
  });

  app.get("/api/provider/bookings", async (req, res) => {
    try {
      const bookings = await storage.getProviderBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider bookings" });
    }
  });

  app.get("/api/provider/services", async (req, res) => {
    try {
      const services = await storage.getProviderServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider services" });
    }
  });

  // Admin Panel Routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/pending-approvals", async (req, res) => {
    try {
      const approvals = await storage.getPendingApprovals();
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending approvals" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const { search } = req.query;
      const users = await storage.getUsers(search as string);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/approve/:id", async (req, res) => {
    try {
      const result = await storage.approveItem(parseInt(req.params.id));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve item" });
    }
  });

  app.post("/api/admin/reject/:id", async (req, res) => {
    try {
      const result = await storage.rejectItem(parseInt(req.params.id));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject item" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      // In a real app, this would send an email or store the message
      console.log("Contact form submission:", req.body);
      res.json({ message: "Message sent successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
